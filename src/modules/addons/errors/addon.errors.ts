import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from "../../../errors/custom-errors";

export class AddonNotFoundError extends NotFoundError {
  constructor(addonId?: string) {
    super(addonId ? `Adicional com ID ${addonId} não encontrado` : "Adicional não encontrado", "ADDON_NOT_FOUND");
  }
}

export class AddonAlreadyExistsError extends ConflictError {
  constructor(name: string) {
    super(`Adicional com nome '${name}' já existe`, "ADDON_ALREADY_EXISTS");
  }
}

export class InvalidAddonPriceError extends ValidationError {
  constructor() {
    super("Preço do adicional deve ser maior ou igual a 0", "INVALID_ADDON_PRICE");
  }
}

export class InvalidAddonNameError extends ValidationError {
  constructor() {
    super("Nome do adicional é obrigatório", "INVALID_ADDON_NAME");
  }
}

export class ProductRequiredForAddonError extends ValidationError {
  constructor() {
    super("ID do produto é obrigatório para criar um adicional", "PRODUCT_REQUIRED_FOR_ADDON");
  }
}

export class AddonPermissionDeniedError extends ForbiddenError {
  constructor() {
    super("Apenas administradores podem gerenciar adicionais", "ADDON_PERMISSION_DENIED");
  }
}
