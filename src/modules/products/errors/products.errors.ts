import { NotFoundError, ValidationError } from "../../../errors/custom-errors";

export class ProductNotFoundError extends NotFoundError {
  constructor(productId?: string) {
    super(productId ? `Produto com ID ${productId} não encontrado` : "Produto não encontrado", "PRODUCT_NOT_FOUND");
  }
}

export class InvalidPriceError extends ValidationError {
  constructor() {
    super("Preço deve ser maior do que 0", "INVALID_PRICE");
  }
}

export class InvalidProductDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_PRODUCT_DATA");
  }
}