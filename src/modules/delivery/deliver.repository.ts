import { prisma } from "../../../prisma/db";

interface CreateDeliveryFeeData {
  district: string;
  price: number;
  isActive?: boolean;
}

interface UpdateDeliveryFeeData {
  district?: string;
  price?: number;
  isActive?: boolean;
}

export class DeliveryRepository {
  // Buscar todos os bairros ativos (público)
  async findActiveDistricts() {
    return prisma.deliveryFee.findMany({
      where: { isActive: true },
      select: {
        district: true,
        price: true,
      },
      orderBy: {
        district: 'asc',
      },
    });
  }

  // Buscar todos os bairros (admin)
  async findAll() {
    return prisma.deliveryFee.findMany({
      orderBy: {
        district: 'asc',
      },
    });
  }

  // Buscar por bairro (nome)
  async findByDistrict(district: string) {
    return prisma.deliveryFee.findFirst({
      where: {
        district,
        isActive: true,
      },
    });
  }

  // Buscar por ID
  async findById(id: string) {
    return prisma.deliveryFee.findUnique({
      where: { id },
    });
  }

  // Verificar se bairro já existe
  async existsByDistrict(district: string) {
    const existing = await prisma.deliveryFee.findFirst({
      where: { district },
    });
    return !!existing;
  }

  // Criar novo bairro
  async create(data: CreateDeliveryFeeData) {
    return prisma.deliveryFee.create({
      data: {
        district: data.district,
        price: data.price,
        isActive: data.isActive ?? true,
      },
    });
  }

  // Atualizar bairro
  async update(id: string, data: UpdateDeliveryFeeData) {
    return prisma.deliveryFee.update({
      where: { id },
      data,
    });
  }

  // Deletar bairro
  async delete(id: string) {
    return prisma.deliveryFee.delete({
      where: { id },
    });
  }
}