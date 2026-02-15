import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../prisma/db";

export class OrderRepository {
  create(
    data: Prisma.OrderCreateInput,
    db: Prisma.TransactionClient | typeof prisma = prisma
  ) {
    return db.order.create({
      data,
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

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
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
    });
  }

  findByUserId(userId: string, limit?: number, offset?: number) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  updateStatus(id: string, status: any) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  findByStatus(status: any) {
    return prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });
  }

  findAll() {
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
      orderBy: { createdAt: "desc" },
    });
  }

  delete(id: string) {
    return prisma.order.delete({ where: { id } });
  }

  findByPaymentOrderId(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
      },
    });
  }
}
