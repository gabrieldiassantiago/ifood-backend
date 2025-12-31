import { MercadoPagoConfig, Payment } from "mercadopago";

let mercadoPagoClient: Payment;

export const configureMercadoPago = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente");
  }

  const client = new MercadoPagoConfig({ 
    accessToken,
    options: { timeout: 5000 }
  });
  
  mercadoPagoClient = new Payment(client);
};

export const getMercadoPagoClient = (): Payment => {

  if (!mercadoPagoClient) {
    throw new Error("Mercado Pago não foi configurado. Chame configureMercadoPago() primeiro.");
  }
  
  return mercadoPagoClient;
};
