import { OrderRepository } from "./order.repository";
import { CreateOrderInput, OrderSummary } from "./order.types";
import { prisma } from "../../../prisma/db";
import {
  OrderNotFoundError,
  InvalidOrderItemError,
  ProductNotAvailableError,
  InvalidQuantityError,
  DeliveryFeeNotFoundError,
  PaymentRequiredError,
} from "./errors/order.errors";
import { OrderStatus } from "../../../generated/prisma/enums";
import { PaymentService } from "../payments/payment.service";
import { wsService } from "../websocket/websocket.service";

export class OrderService {
  constructor(
    private repository: OrderRepository = new OrderRepository(),
    private paymentService: PaymentService = new PaymentService(),
  ) {}

  async createOrder(data: CreateOrderInput) {

    if (!data.items || data.items.length === 0) {
      throw new InvalidOrderItemError("Pedido deve conter pelo menos um item");
    }
    
    if (!data.deliveryType) {
      data.deliveryType = 'DELIVERY';
    }

    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new InvalidQuantityError();
      }
    }

    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== productIds.length) {
      throw new InvalidOrderItemError("Um ou mais produtos não foram encontrados");
    }

    for (const product of products) {
      if (!product.isAvailable) {
        throw new ProductNotAvailableError(product.id);
      }
    }

    // Calcular subtotal
    let subtotal = 0;
    
    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Preço do produto * quantidade
        subtotal += product.price * item.quantity;
        
        // Somar preço dos addons
        if (item.addons && item.addons.length > 0) {
          const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
          subtotal += addonsTotal * item.quantity;
        }
      }
    }

    let deliveryFeeValue = 0;
  
    
    if (data.deliveryType === 'PICKUP') {
      deliveryFeeValue = 0;
    } else {
      console.log('📦 DELIVERY - buscando taxa de entrega para:', data.deliveryDistrict);
      const deliveryFee = await prisma.deliveryFee.findFirst({
        where: {
          district: data.deliveryDistrict,
          isActive: true,
        },
      });

      if (!deliveryFee) {
        throw new DeliveryFeeNotFoundError(data.deliveryDistrict);
      }
      
      deliveryFeeValue = deliveryFee.price;
      console.log('💰 Taxa de entrega encontrada:', deliveryFeeValue);
    }

    // Calcular total
    const total = subtotal + deliveryFeeValue;

    if (data.paymentMethod === "CASH") {

      if (data.changeFor && data.changeFor < total) {
        throw new Error("Valor para troco é insuficiente para o total do pedido");
      }
      
    }

    const initialStatus = data.paymentMethod === 'PIX' 
      ? OrderStatus.PENDING_PAYMENT 
      : OrderStatus.PENDING;
    
    const order = await this.repository.create({
      ...data,
      items: data.items,
      subtotal,
      deliveryFee: deliveryFeeValue,
      total,
      status: initialStatus,
      deliveryType: data.deliveryType || 'DELIVERY',
      observation: data.observation || undefined,
    });

    wsService.broadcastToAdmins("order:created", {
      orderId: order.id,
      order: order,
      message: "Novo pedido recebido!",
    });

    return order;
  }

  async getOrderById(id: string) {
    const order = await this.repository.findById(id);

    if (!order) {
      throw new OrderNotFoundError(id);
    }

    return order;
  }

  async getOrdersByUserId(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async getAllOrders() {
    return this.repository.findAll();
  }

  async getOrdersByStatus(status: OrderStatus) {
    return this.repository.findByStatus(status);
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    await this.getOrderById(id);

    const updatedOrder = await this.repository.updateStatus(id, status);

    wsService.broadcastToAdmins("order:status_updated", {
      orderId: id,
      status: status,
      order: updatedOrder,
    });

    // Notificar o cliente dono do pedido
    if (updatedOrder.userId) {
      wsService.sendToUser(updatedOrder.userId, "order:status_updated", {
        orderId: id,
        newStatus: status,
        order: updatedOrder,
      });
    }

    if (updatedOrder.paymentMethod === "PIX" && status === OrderStatus.CANCELLED) {
      try {

        const payment = await this.paymentService.getPaymentByOrderId(id);

        if (payment && payment.status === "APPROVED" && payment.paymentId) {
          await this.paymentService.refundPayment({
            paymentId: payment.paymentId,
          });
        }
      } catch (error) {
        console.error("Erro ao processar reembolso:", error);
        throw new Error("Falha ao processar reembolso do pagamento PIX");
      }
    } 
    

    // Notificar o cliente dono do pedido
    if (updatedOrder.userId) {
      wsService.sendToUser(updatedOrder.userId, "order:status_updated", {
        orderId: id,
        status: status,
        message: `Seu pedido foi atualizado para: ${status}`,
      });
    }

    return updatedOrder;
  }

  async confirmPixPayment(orderId: string) {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new Error('Apenas pedidos com pagamento pendente podem ser confirmados');
    }

    if (order.paymentMethod !== 'PIX') {
      throw new Error('Apenas pedidos PIX podem ser confirmados por este método');
    }

    const updatedOrder = await this.repository.updateStatus(orderId, OrderStatus.PENDING);

    // Emitir evento de novo pedido para admins agora que foi pago
    wsService.broadcastToAdmins('order:created', {
      orderId: updatedOrder.id,
      order: updatedOrder,
      message: 'Novo pedido recebido (PIX confirmado)!',
    });

    // Notificar o cliente
    if (updatedOrder.userId) {
      wsService.sendToUser(updatedOrder.userId, 'order:payment_confirmed', {
        orderId: updatedOrder.id,
        message: 'Pagamento confirmado! Seu pedido está sendo preparado.',
      });
    }

    return updatedOrder;
  }

  async cancelOrder(id: string) {
    const order = await this.getOrderById(id);

    // Não permite cancelar pedidos já entregues ou já cancelados
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new InvalidOrderItemError(`Pedidos com status ${order.status} não podem ser cancelados`);
    }

    // Reembolsar pagamento PIX se foi aprovado
    if (order.paymentMethod === "PIX") {
      try {
        const payment = await this.paymentService.getPaymentByOrderId(id);
        
        if (payment && payment.status === 'APPROVED' && payment.paymentId) {
          
         await this.paymentService.refundPayment({
            paymentId: payment.paymentId,
          });

        } else {
        throw new Error('Pagamento PIX não aprovado ou inexistente, não é possível reembolsar');
        }
      } catch (error) {
        throw new Error('Falha ao processar reembolso do pagamento PIX');
      }
    }

    const cancelledOrder = await this.repository.updateStatus(id, OrderStatus.CANCELLED);

    // Notificar o cliente
    if (cancelledOrder.userId) {
      wsService.sendToUser(cancelledOrder.userId, 'order:cancelled', {
        orderId: id,
        message: 'Seu pedido foi cancelado.',
      });
    }

    // Notificar admins
    wsService.broadcastToAdmins('order:cancelled', {
      orderId: id,
      order: cancelledOrder,
    });

    return cancelledOrder;
  }

  async calculateOrderSummary(
    items: Array<{ productId: string; quantity: number; addons?: Array<{ price: number }> }>,
    deliveryDistrict: string
  ): Promise<OrderSummary> {

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Calcular subtotal

    let subtotal = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new InvalidOrderItemError(`Produto ${item.productId} não encontrado`);
      }

      const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      const itemTotal = (product.price + addonsTotal) * item.quantity;
      subtotal += itemTotal;
    }

    // Buscar taxa de entrega
    const deliveryFee = await prisma.deliveryFee.findFirst({
      where: {
        district: deliveryDistrict,
        isActive: true,
      },
    });

    if (!deliveryFee) {
      throw new DeliveryFeeNotFoundError(deliveryDistrict);
    }

    const total = subtotal + deliveryFee.price;

    return {
      subtotal,
      deliveryFee: deliveryFee.price,
      total,
    };
  }

  async deleteOrder(id: string) {
    await this.getOrderById(id);
    return this.repository.delete(id);
  }
}
