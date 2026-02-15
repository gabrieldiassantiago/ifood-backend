import { OrderRepository } from "./order.repository";
import { CreateOrderInput, OrderSummary } from "./order.types";
import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../../prisma/db";
import { Prisma } from "../../../generated/prisma/client";

import {
  InvalidOrderItemError,
  InvalidQuantityError,
  OrderNotFoundError
} from "./errors/order.errors";
import { DeliveryFeeNotFoundError } from "../delivery/errors/delivery.errors";
import { wsService } from "../websocket/websocket.service";

export class OrderService {
  constructor(
    private repository: OrderRepository = new OrderRepository(),
  ) { }

  async createOrder(data: CreateOrderInput) {
    
    if (!data.items.length) {
      throw new InvalidOrderItemError("Pedido sem itens");
    }

    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new InvalidQuantityError();
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: data.items.map(i => i.productId) } }
      });

      if (products.length !== data.items.length) {
        throw new InvalidOrderItemError("Produto não encontrado");
      }

      let subtotal = 0;

      const itemsCreate = data.items.map(item => {

        const product = products.find(p => p.id === item.productId)!;

        const addonsTotal =
          item.addons?.reduce((s, a) => s + a.price, 0) ?? 0;

        const price = (product.price + addonsTotal) * item.quantity;
        subtotal += price;

        return {
          product: { connect: { id: product.id } },
          quantity: item.quantity,
          observation: item.observation,
          price,
          addons: {
            create: item.addons?.map(a => ({
              name: a.name,
              price: a.price
            })) ?? []
          }
        };
      });

      let deliveryFee = 0;

      if (data.deliveryType === "DELIVERY") {
        const fee = await tx.deliveryFee.findFirst({
          where: {
            district: data.deliveryDistrict,
            isActive: true
          }
        });

        if (!fee) {
          throw new DeliveryFeeNotFoundError(data.deliveryDistrict);
        }

        deliveryFee = fee.price;
      }

      const total = subtotal + deliveryFee;

      if (data.paymentMethod === "CASH" && data.changeFor !== undefined) {
        if (data.changeFor < total) {
          throw new Error(`O valor para troco (R$ ${data.changeFor.toFixed(2)}) deve ser maior ou igual ao total do pedido (R$ ${total.toFixed(2)})`);
        }
      }

      const status =
        data.paymentMethod === "PIX"
          ? OrderStatus.PENDING_PAYMENT
          : OrderStatus.PENDING;

      const orderData: Prisma.OrderCreateInput = {
        user: { connect: { id: data.userId } },
        deliveryDistrict: data.deliveryDistrict,
        deliveryType: data.deliveryType,
        paymentMethod: data.paymentMethod,
        changeFor: data.changeFor,
        observation: data.observation,
        subtotal,
        deliveryFee,
        total,
        status,
        items: { create: itemsCreate }
      };

      if (data.deliveryType === "DELIVERY") {
        orderData.address = {
          connect: { id: data.addressId }
        };
      }

      return this.repository.create(orderData, tx);
    });

    wsService.broadcastToAdmins("order:created", { order });

    return order;
  }

  async getOrderById(id: string) {
    const order = await this.repository.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return order;
  }

  async getOrdersByUserId(userId: string, limit?: number, offset?: number) {
    return this.repository.findByUserId(userId, limit, offset);
  }

  async getAllOrders() {
    return this.repository.findAll();
  }

  async getOrdersByStatus(status: string) {
    return this.repository.findByStatus(status);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.repository.updateStatus(id, status);
  }

  async deleteOrder(id: string) {
    return this.repository.delete(id);
  }

  async calculateOrderSummary(
    items: Array<{ productId: string; quantity: number; addons?: Array<{ price: number }> }>,
    deliveryDistrict: string,
    deliveryType: "DELIVERY" | "PICKUP" = "DELIVERY"
  ): Promise<OrderSummary> {

    const products = await prisma.product.findMany({
      where: { id: { in: items.map(i => i.productId) } }
    });

    let subtotal = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new InvalidOrderItemError("Produto não encontrado");
      }

      const addonsTotal =
        item.addons?.reduce((s, a) => s + a.price, 0) ?? 0;

      subtotal += (product.price + addonsTotal) * item.quantity;
    }

    let deliveryFee = 0;

    if (deliveryType === "DELIVERY") {
      const fee = await prisma.deliveryFee.findFirst({
        where: {
          district: deliveryDistrict,
          isActive: true
        }
      });

      if (!fee) {
        throw new DeliveryFeeNotFoundError(deliveryDistrict);
      }

      deliveryFee = fee.price;
    }

    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    };
  }

  async cancelOrderPending(orderId: string) {
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new Error("Pedido não encontrado");
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error("Pedido já foi cancelado");
    }

    await this.repository.updateStatus(orderId, OrderStatus.PENDING_CANCELLATION);
  }

}
