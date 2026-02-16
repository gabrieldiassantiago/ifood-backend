import { Payment, PaymentRefund } from "mercadopago";

export interface MercadoPagoClientConfig {
  accessToken?: string;
  timeout?: number;
  options?: {
    idempotencyKey?: string;
    requestId?: string;
    requestOptions?: any;
  };
}

export interface IMercadoPagoService {
  configure(config?: MercadoPagoClientConfig): void;
  getPaymentClient(): Payment;
  getRefundClient(): PaymentRefund;
  isReady(): boolean;
  reset(): void;
}

export type MercadoPagoConfigOptions = {
  accessToken: string;
  timeout?: number;
};