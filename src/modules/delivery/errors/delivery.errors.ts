import { NotFoundError, ValidationError, ConflictError } from "../../../errors/custom-errors";

export class DeliveryFeeNotFoundError extends NotFoundError {
  constructor(district?: string) {
    super(district ? `Taxa de entrega não encontrada para o bairro: ${district}` : "Taxa de entrega não encontrada", "DELIVERY_FEE_NOT_FOUND");
  }
}

export class DeliveryFeeAlreadyExistsError extends ConflictError {
  constructor(district: string) {
    super(`Taxa de entrega para o bairro '${district}' já existe`, "DELIVERY_FEE_ALREADY_EXISTS");
  }
}

export class InvalidDeliveryFeeError extends ValidationError {
  constructor() {
    super("Taxa de entrega inválida", "INVALID_DELIVERY_FEE");
  }
}

export class InvalidDeliveryDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_DELIVERY_DATA");
  }
}

export class DeliveryZoneNotCoveredError extends ValidationError {
  constructor() {
    super("Endereço fora da área de entrega", "DELIVERY_ZONE_NOT_COVERED");
  }
}

export class MinimumOrderValueError extends ValidationError {
  constructor(minValue: number) {
    super(`Pedido mínimo de R$ ${minValue.toFixed(2)} para entrega`, "MINIMUM_ORDER_VALUE");
  }
}

export class DeliveryTimeSlotNotAvailableError extends ConflictError {
  constructor() {
    super("Horário de entrega indisponível", "DELIVERY_TIME_SLOT_NOT_AVAILABLE");
  }
}
