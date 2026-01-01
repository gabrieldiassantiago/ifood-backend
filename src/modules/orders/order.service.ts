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

export class OrderService {
  constructor(
    private repository: OrderRepository = new OrderRepository(),
    private paymentService: PaymentService = new PaymentService(),
  ) {}

  async createOrder(data: CreateOrderInput) {

    if (!data.items || data.items.length === 0) {
      throw new InvalidOrderItemError("Pedido deve conter pelo menos um item");
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

    const deliveryFee = await prisma.deliveryFee.findFirst({
      where: {
        district: data.deliveryDistrict,
        isActive: true,
      },
    });

    if (!deliveryFee) {
      throw new DeliveryFeeNotFoundError(data.deliveryDistrict);
    }

    // Calcular total
    const total = subtotal + deliveryFee.price;

    if (data.paymentMethod === "CASH") {
      if (data.changeFor && data.changeFor < total) {

        throw new Error("Valor para troco é insuficiente para o total do pedido");
      }
      
    }

    // Criar pedido
    const order = await this.repository.create({
      ...data,
      items: data.items,
      subtotal,
      deliveryFee: deliveryFee.price,
      total,
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

    return this.repository.updateStatus(id, status);
  }

  async cancelOrder(id: string) {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.CREATED) {
      throw new InvalidOrderItemError("Apenas pedidos com status CREATED podem ser cancelados");
    }

    if (order.paymentMethod === "PIX") {
      
      //falta implementar estorno via paymentService
      
    }

    return this.repository.updateStatus(id, OrderStatus.CANCELLED);
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
