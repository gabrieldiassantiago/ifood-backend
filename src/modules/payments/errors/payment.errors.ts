import { NotFoundError, ValidationError, ConflictError, BadRequestError } from "../../../errors/custom-errors";

// Note: BadRequestError might not exist in custom-errors, let's create a base for it or use ValidationError
export class PaymentNotFoundError extends NotFoundError {
  constructor(paymentId?: string) {
    super(paymentId ? `Pagamento ${paymentId} não encontrado` : "Pagamento não encontrado", "PAYMENT_NOT_FOUND");
  }
}

export class PaymentAlreadyExistsError extends ConflictError {
  constructor(orderId?: string) {
    super(orderId ? `Já existe um pagamento para o pedido ${orderId}` : "Já existe um pagamento para este pedido", "PAYMENT_ALREADY_EXISTS");
  }
}

export class MercadoPagoError extends BadRequestError {
  constructor(message: string) {
    super(`Erro no Mercado Pago: ${message}`, "MERCADO_PAGO_ERROR");
  }
}

export class InvalidPaymentMethodError extends ValidationError {
  constructor() {
    super("Método de pagamento inválido", "INVALID_PAYMENT_METHOD");
  }
}

export class PaymentAmountMismatchError extends ValidationError {
  constructor(expected: number, received: number) {
    super(`Valor do pagamento (${received}) não corresponde ao valor do pedido (${expected})`, "PAYMENT_AMOUNT_MISMATCH");
  }
}

export class PaymentExpiredError extends ValidationError {
  constructor() {
    super("Pagamento expirado", "PAYMENT_EXPIRED");
  }
}

export class PaymentRefundError extends BadRequestError {
  constructor(message: string) {
    super(`Erro ao processar reembolso: ${message}`, "PAYMENT_REFUND_ERROR");
  }
}

export class PaymentProcessingError extends BadRequestError {
  constructor(message: string) {
    super(`Erro ao processar pagamento: ${message}`, "PAYMENT_PROCESSING_ERROR");
  }
}
