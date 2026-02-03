import { AddressRepository, CreateAddressInput } from "./address.repository";
import { AddressNotFoundError, AddressPermissionDeniedError } from "./errors/address.errors";

export class AddressService {
  constructor(
    private repository: AddressRepository = new AddressRepository()
  ) {}

  async createAddress(data: CreateAddressInput) {
    return await this.repository.create(data);
  }

  async getUserAddresses(userId: string) {
    return await this.repository.findAllByUserId(userId);
  }

  async deleteAddress(id: string, userId: string) {
    // Verificar se o endereço pertence ao usuário
    const address = await this.repository.findByIdAndUserId(id, userId);

    if (!address) {
      throw new AddressPermissionDeniedError();
    }

    await this.repository.delete(id);
    return { message: "Endereço deletado com sucesso" };
  }
}