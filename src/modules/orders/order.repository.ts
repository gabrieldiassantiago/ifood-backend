import { prisma } from "../../../prisma/db";
import { OrderStatus } from "../../../generated/prisma/enums";
import { CreateOrderInput } from "./order.types";

export class OrderRepository {
  async create(data: CreateOrderInput & { subtotal: number; deliveryFee: number; total: number }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        addressId: data.addressId,
        deliveryDistrict: data.deliveryDistrict,
        paymentMethod: data.paymentMethod,
        changeFor: data.changeFor,
        observation: data.observation,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        status: OrderStatus.CREATED,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0, // Será calculado no service
            addons: {
              create: item.addons?.map((addon) => ({
                name: addon.name,
                price: addon.price,
              })) || [],
            },
          })),
        },
      },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findAll() {
    return prisma.order.findMany({
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
    });
  }

  async findByStatus(status: OrderStatus) {
    return prisma.order.findMany({
      where: { status },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
            addons: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async delete(id: string) {
    return prisma.order.delete({
      where: { id },
    });
  }
}
