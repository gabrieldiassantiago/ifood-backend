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
            isActive: true,
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

  getAllAddons() {
    return prisma.addon.findMany({
      where: { isActive: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      }
    });
  }


  findAllActive() {
    return prisma.product.findMany({
      where: {
        category: {
          isActive: true,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true,
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
            isActive: true,
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
      where: { 
        categoryId,
        category: {
          isActive: true,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        addons: {
          where: { isActive: true },
        },
      },
    });
  }
  
  findExistCategory(categoryId: string) {
    return prisma.category.findUnique({
      where: { id: categoryId, isActive: true },
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

  createAddon(productId: string, data: { name: string; price: number }) {
    return prisma.addon.create({
      data: {
        name: data.name,
        price: data.price,
        productId,
      },
    });
  }

  findAddonsByProductId(productId: string) {
    return prisma.addon.findMany({
      where: { productId, isActive: true },
    });
  }

  updateAddon(id: string, data: { name?: string; price?: number; isActive?: boolean }) {
    return prisma.addon.update({
      where: { id },
      data,
    });
  }

  deleteAddon(id: string) {
    return prisma.addon.delete({
      where: { id },
    });
  }

}
