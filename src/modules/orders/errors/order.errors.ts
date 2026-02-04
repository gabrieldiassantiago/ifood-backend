import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from "../../../errors/custom-errors";

export class OrderNotFoundError extends NotFoundError {
  constructor(orderId?: string) {
    super(orderId ? `Pedido ${orderId} não encontrado` : "Pedido não encontrado", "ORDER_NOT_FOUND");
  }
}

export class InvalidOrderItemError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_ORDER_ITEM");
  }
}

export class DeliveryFeeNotFoundError extends NotFoundError {
  constructor(locationId?: string) {
    super(locationId ? `Taxa de entrega para localização ${locationId} não encontrada` : "Taxa de entrega não encontrada", "DELIVERY_FEE_NOT_FOUND");
  }
}

export class ProductNotAvailableError extends ValidationError {
  constructor(productId?: string) {
    super(productId ? `Produto ${productId} não está disponível` : "Produto não está disponível", "PRODUCT_NOT_AVAILABLE");
  }
}

export class InvalidQuantityError extends ValidationError {
  constructor() {
    super("Quantidade deve ser maior que zero", "INVALID_QUANTITY");
  }
}

export class OrderAlreadyPaidError extends ConflictError {
  constructor(orderId?: string) {
    super(orderId ? `Pedido ${orderId} já possui pagamento associado` : "Pedido já possui pagamento associado", "ORDER_ALREADY_PAID");
  }
}

export class PaymentRequiredError extends ValidationError {
  constructor() {
    super("Pagamento obrigatório para pedidos com PIX", "PAYMENT_REQUIRED");
  }
}

export class OrderCannotBeCancelledError extends ForbiddenError {
  constructor(status?: string) {
    super(status ? `Pedido com status '${status}' não pode ser cancelado` : "Pedido não pode ser cancelado", "ORDER_CANNOT_BE_CANCELLED");
  }
}

export class OrderAlreadyCancelledError extends ConflictError {
  constructor() {
    super("Pedido já está cancelado", "ORDER_ALREADY_CANCELLED");
  }
}

export class EmptyOrderError extends ValidationError {
  constructor() {
    super("Pedido deve conter pelo menos um item", "EMPTY_ORDER");
  }
}

export class InvalidOrderStatusError extends ValidationError {
  constructor(currentStatus: string, newStatus: string) {
    super(`Não é possível alterar status de '${currentStatus}' para '${newStatus}'`, "INVALID_ORDER_STATUS");
  }
}
