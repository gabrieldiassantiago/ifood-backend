import { MercadoPagoConfig, Payment, PaymentRefund } from "mercadopago";
import { IMercadoPagoService, MercadoPagoClientConfig } from "./mercadopago.types";
import { MercadoPagoAccessTokenError, MercadoPagoNotConfiguredError } from "./errors/mercadopago.errors";


export class MercadoPagoService implements IMercadoPagoService {
  private static instance: MercadoPagoService;
  private paymentClient: Payment | null = null;
  private refundClient: PaymentRefund | null = null;
  private isConfigured = false;

  private constructor() {}

  public static getInstance(): MercadoPagoService {
    if (!MercadoPagoService.instance) {
      MercadoPagoService.instance = new MercadoPagoService();
    }
    return MercadoPagoService.instance;
  }

  public configure(config?: MercadoPagoClientConfig): void {
    const accessToken = config?.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new MercadoPagoAccessTokenError();
    }

    const clientConfig = new MercadoPagoConfig({
      accessToken,
      options: { 
        timeout: config?.timeout || 5000,
        ...config?.options
      }
    });

    this.paymentClient = new Payment(clientConfig);
    this.refundClient = new PaymentRefund(clientConfig);
    this.isConfigured = true;
  }

  public getPaymentClient(): Payment {
    if (!this.isConfigured || !this.paymentClient) {
      throw new MercadoPagoNotConfiguredError();
    }
    return this.paymentClient;
  }

  public getRefundClient(): PaymentRefund {
    if (!this.isConfigured || !this.refundClient) {
      throw new MercadoPagoNotConfiguredError();
    }
    return this.refundClient;
  }

  public isReady(): boolean {
    return this.isConfigured;
  }

  public reset(): void {
    this.paymentClient = null;
    this.refundClient = null;
    this.isConfigured = false;
  }
}

export const mercadoPagoService = MercadoPagoService.getInstance();