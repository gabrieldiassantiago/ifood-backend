import { prisma } from "../../../prisma/db";
import { CreateProductInput, UpdateProductInput } from "./product.model";

export class ProductRepository {
  findAll() {
    return prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        addons: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        addons: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  findByCategory(categoryId: string) {
    return prisma.product.findMany({
      where: { categoryId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        addons: {
          where: { isActive: true },
        },
      },
    });
  }

  create(data: CreateProductInput) {
    return prisma.product.create({
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
