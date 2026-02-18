import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from "../../../errors/custom-errors";

export class StoreNotFoundError extends NotFoundError {
  constructor(storeId?: string) {
    super(storeId ? `Loja com ID ${storeId} não encontrada` : "Loja não encontrada", "STORE_NOT_FOUND");
  }
}

export class StoreAlreadyExistsError extends ConflictError {
  constructor() {
    super("Já existe uma loja cadastrada", "STORE_ALREADY_EXISTS");
  }
}

export class InvalidStoreDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_STORE_DATA");
  }
}

export class StoreClosedError extends ValidationError {
  constructor() {
    super("Loja está fechada no momento", "STORE_CLOSED");
  }
}

export class OutsideBusinessHoursError extends ValidationError {
  constructor(openingTime: string, closingTime: string) {
    super(`Fora do horário de funcionamento (${openingTime} - ${closingTime})`, "OUTSIDE_BUSINESS_HOURS");
  }
}

export class StoreMaintenanceError extends ValidationError {
  constructor() {
    super("Loja em manutenção. Tente novamente mais tarde", "STORE_MAINTENANCE");
  }
}

export class StorePermissionDeniedError extends ForbiddenError {
  constructor() {
    super("Apenas administradores podem gerenciar a loja", "STORE_PERMISSION_DENIED");
  }
}
