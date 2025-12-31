export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Pagamento ${id} não encontrado`);
    this.name = "PaymentNotFoundError";
  }
}

export class PaymentAlreadyExistsError extends Error {
  constructor(orderId: string) {
    super(`Já existe um pagamento para o pedido ${orderId}`);
    this.name = "PaymentAlreadyExistsError";
  }
}

export class MercadoPagoError extends Error {
  constructor(message: string) {
    super(`Erro no Mercado Pago: ${message}`);
    this.name = "MercadoPagoError";
  }
}

export class InvalidPaymentMethodError extends Error {
  constructor() {
    super("Método de pagamento inválido");
    this.name = "InvalidPaymentMethodError";
  }
}
