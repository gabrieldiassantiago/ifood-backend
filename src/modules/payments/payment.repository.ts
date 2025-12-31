import { prisma } from "../../../prisma/db";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { CreatePaymentInput } from "./payment.types";

export class PaymentRepository {
  async create(data: CreatePaymentInput & { paymentId?: string; qrCode?: string; qrCodeBase64?: string; ticketUrl?: string }) {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        paymentId: data.paymentId,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
        status: PaymentStatus.PENDING,
      },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: {
              include: {
                product: true,
                addons: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: {
              include: {
                product: true,
                addons: true,
              },
            },
          },
        },
      },
    });
  }

  async findByPaymentId(paymentId: string) {
    return prisma.payment.findUnique({
      where: { paymentId },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: true,
          },
        },
      },
    });
  }

  async findByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      include: {
        order: true,
      },
    });
  }

  async updateStatus(paymentId: string, status: PaymentStatus) {
    return prisma.payment.update({
      where: { paymentId },
      data: { status },
      include: {
        order: true,
      },
    });
  }

  async findAll() {
    return prisma.payment.findMany({
      include: {
        order: {
          include: {
            user: true,
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
