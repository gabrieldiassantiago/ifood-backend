import { prisma } from "../../../prisma/db";
import { OrderStatus } from "../../../generated/prisma/enums";
import { CreateOrderInput } from "./order.types";

export class OrderRepository {
  async create(data: CreateOrderInput & { subtotal: number; deliveryFee: number; total: number; status?: OrderStatus; deliveryType?: string }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        addressId: data.addressId,
        deliveryDistrict: data.deliveryDistrict,
        deliveryType: data.deliveryType as any || 'DELIVERY',
        paymentMethod: data.paymentMethod,
        changeFor: data.changeFor,
        observation: data.observation,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        status: data.status,
        items: {
          create: await Promise.all(data.items.map(async (item) => {

            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });
            
            if (!product) {
              throw new Error(`Produto ${item.productId} não encontrado`);
            }
            
            let addonsTotal = 0;
            if (item.addons && item.addons.length > 0) {
              addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
            }
            const itemPrice = (product.price + addonsTotal) * item.quantity;
            
            return {
              productId: item.productId,
              quantity: item.quantity,
              observation: item.observation || undefined,
              price: itemPrice,
              addons: {
                create: item.addons?.map((addon) => ({
                  name: addon.name,
                  price: addon.price,
                })) || [],
              },
            };
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
