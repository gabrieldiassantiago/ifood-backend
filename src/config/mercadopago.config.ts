import { Payment, PaymentRefund } from "mercadopago";
import { mercadoPagoService } from "./mercadopago.service";
import { MercadoPagoClientConfig } from "./mercadopago.types";

/**
 * Configura o MercadoPago com as credenciais necessárias
 * @param config 
 */
export const configureMercadoPago = (config?: MercadoPagoClientConfig): void => {
  mercadoPagoService.configure(config);
};

/**
 * Retorna o cliente de pagamentos do MercadoPago
 * @returns Cliente de pagamentos configurado
 * @throws {MercadoPagoNotConfiguredError} Se o MercadoPago não foi configurado
 */
export const getMercadoPagoClient = (): Payment => {
  return mercadoPagoService.getPaymentClient();
};

/**
 * Retorna o cliente de reembolsos do MercadoPago
 * @returns Cliente de reembolsos configurado
 * @throws {MercadoPagoNotConfiguredError} Se o MercadoPago não foi configurado
 */
export const getMercadoPagoRefundClient = (): PaymentRefund => {
  return mercadoPagoService.getRefundClient();
};

/**
 * Verifica se o MercadoPago está configurado e pronto para uso
 * @returns True se está configurado, false caso contrário
 */

export const isMercadoPagoReady = (): boolean => {
  return mercadoPagoService.isReady();
};

/**
 * Reseta a configuração do MercadoPago
 */
export const resetMercadoPago = (): void => {
  mercadoPagoService.reset();
};
