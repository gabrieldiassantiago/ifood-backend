export class MercadoPagoError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class MercadoPagoAccessTokenError extends MercadoPagoError {
  constructor() {
    super(
      "MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente",
      "MERCADOPAGO_ACCESS_TOKEN_MISSING"
    );
  }
}

export class MercadoPagoNotConfiguredError extends MercadoPagoError {
  constructor() {
    super(
      "MercadoPago não foi configurado. Chame mercadoPagoService.configure() primeiro.",
      "MERCADOPAGO_NOT_CONFIGURED"
    );
  }
}

export class MercadoPagoClientError extends MercadoPagoError {
  constructor(operation: string, originalError?: Error) {
    super(
      `Erro ao executar operação do MercadoPago: ${operation}. ${originalError?.message || ""}`,
      "MERCADOPAGO_CLIENT_ERROR"
    );
    this.stack = originalError?.stack || this.stack;
  }
}