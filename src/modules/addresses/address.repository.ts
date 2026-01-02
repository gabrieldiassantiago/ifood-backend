import { prisma } from "../../../prisma/db";

export interface CreateAddressInput {
  street: string;
  number: string;
  district: string;
  city: string;
  reference?: string;
  userId: string;
}

export class AddressRepository {
  create(data: CreateAddressInput) {
    return prisma.address.create({
      data,
    });
  }

  findAllByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
    });
  }

  findById(id: string) {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  findByIdAndUserId(id: string, userId: string) {
    return prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  delete(id: string) {
    return prisma.address.delete({
      where: { id },
    });
  }
}