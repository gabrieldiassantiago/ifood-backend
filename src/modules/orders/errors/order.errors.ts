export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Pedido ${id} não encontrado`);
    this.name = "OrderNotFoundError";
  }
}

export class InvalidOrderItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidOrderItemError";
  }
}

export class ProductNotAvailableError extends Error {
  constructor(productId: string) {
    super(`Produto ${productId} não está disponível`);
    this.name = "ProductNotAvailableError";
  }
}

export class InvalidQuantityError extends Error {
  constructor() {
    super("Quantidade deve ser maior que zero");
    this.name = "InvalidQuantityError";
  }
}

export class DeliveryFeeNotFoundError extends Error {
  constructor(district: string) {
    super(`Taxa de entrega não encontrada para o bairro: ${district}`);
    this.name = "DeliveryFeeNotFoundError";
  }
}

export class OrderAlreadyPaidError extends Error {
  constructor(orderId: string) {
    super(`Pedido ${orderId} já possui pagamento associado`);
    this.name = "OrderAlreadyPaidError";
  }
}

export class PaymentRequiredError extends Error {
  constructor() {
    super("Pagamento obrigatório para pedidos com PIX");
    this.name = "PaymentRequiredError";
  }
}
