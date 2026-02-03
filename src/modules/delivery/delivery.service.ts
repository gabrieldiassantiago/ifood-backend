import { DeliveryRepository } from "./deliver.repository";
import { DeliveryFeeNotFoundError, DeliveryFeeAlreadyExistsError, InvalidDeliveryFeeError } from "./errors/delivery.errors";

interface CreateDeliveryFeeInput {
  district: string;
  price: number;
  isActive?: boolean;
}

interface UpdateDeliveryFeeInput {
  district?: string;
  price?: number;
  isActive?: boolean;
}

export class DeliveryService {
  private repository: DeliveryRepository;

  constructor() {
    this.repository = new DeliveryRepository();
  }

  // Listar bairros ativos (público)
  async getActiveDistricts() {
    return this.repository.findActiveDistricts();
  }

  // Buscar taxa por bairro (público)
  async getFeeByDistrict(district: string) {

    const deliveryFee = await this.repository.findByDistrict(district);
    
    if (!deliveryFee) {
      throw new DeliveryFeeNotFoundError(district);
    }

    return deliveryFee;
  }

  // Listar todos os bairros (admin)
  async getAllDistricts() {
    return this.repository.findAll();
  }

  // Criar novo bairro (admin)
  async createDistrict(data: CreateDeliveryFeeInput) {
    // Validar se bairro já existe
    const exists = await this.repository.existsByDistrict(data.district);
    
    if (exists) {
      throw new DeliveryFeeAlreadyExistsError(data.district);
    }

    // Validar preço
    if (data.price < 0) {
      throw new InvalidDeliveryFeeError();
    }

    return this.repository.create(data);
  }

  // Atualizar bairro (admin)
  async updateDistrict(id: string, data: UpdateDeliveryFeeInput) {
    // Verificar se existe
    const existing = await this.repository.findById(id);
    
    if (!existing) {
      throw new DeliveryFeeNotFoundError();
    }

    // Validar preço se fornecido
    if (data.price !== undefined && data.price < 0) {
      throw new InvalidDeliveryFeeError();
    }

    return this.repository.update(id, data);
  }

  // Alternar status (admin)
  async toggleDistrictStatus(id: string) {
    const deliveryFee = await this.repository.findById(id);

    if (!deliveryFee) {
      throw new DeliveryFeeNotFoundError();
    }

    return this.repository.update(id, {
      isActive: !deliveryFee.isActive,
    });
  }

  // Deletar bairro (admin)
  async deleteDistrict(id: string) {
    // Verificar se existe
    const existing = await this.repository.findById(id);
    
    if (!existing) {
      throw new DeliveryFeeNotFoundError();
    }

    await this.repository.delete(id);
  }
}