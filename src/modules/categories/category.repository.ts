import { prisma } from "../../../prisma/db";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async create(data: { name: string; order: number; isActive?: boolean }) {
    return prisma.category.create({
      data,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; order?: number; isActive?: boolean }) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async delete(id: string) {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (category && category._count.products > 0) {
      throw new Error('Não é possível deletar uma categoria com produtos associados');
    }

    return prisma.category.delete({
      where: { id }
    });
  }

  async toggleActive(id: string) {
    const category = await this.findById(id);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return this.update(id, { isActive: !category.isActive });
  }

  async getNextOrder() {
    const lastCategory = await prisma.category.findFirst({
      orderBy: { order: 'desc' }
    });
    return (lastCategory?.order || 0) + 1;
  }
}
