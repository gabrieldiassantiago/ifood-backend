import { NotFoundError, ValidationError, ForbiddenError } from "../../../errors/custom-errors";

export class AddressNotFoundError extends NotFoundError {
  constructor(addressId?: string) {
    super(addressId ? `Endereço com ID ${addressId} não encontrado` : "Endereço não encontrado", "ADDRESS_NOT_FOUND");
  }
}

export class InvalidCepError extends ValidationError {
  constructor() {
    super("CEP inválido", "INVALID_CEP");
  }
}

export class InvalidAddressDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_ADDRESS_DATA");
  }
}

export class AddressLimitReachedError extends ValidationError {
  constructor() {
    super("Limite máximo de endereços atingido", "ADDRESS_LIMIT_REACHED");
  }
}

export class AddressPermissionDeniedError extends ForbiddenError {
  constructor() {
    super("Você não tem permissão para acessar este endereço", "ADDRESS_PERMISSION_DENIED");
  }
}

export class MainAddressRequiredError extends ValidationError {
  constructor() {
    super("Deve haver pelo menos um endereço principal", "MAIN_ADDRESS_REQUIRED");
  }
}

export class DeliveryAddressNotFoundError extends NotFoundError {
  constructor() {
    super("Endereço de entrega não encontrado para esta área", "DELIVERY_ADDRESS_NOT_FOUND");
  }
}
