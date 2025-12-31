import { PaymentMethod, PaymentStatus } from "../../../generated/prisma/enums";

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  userEmail?: string;
}

export interface PaymentPixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
  ticketUrl?: string;
}

export interface PaymentWebhookData {
  action: string;
  data: {
    id: string;
  };
  type: string;
}

export interface UpdatePaymentStatusInput {
  paymentId: string;
  status: PaymentStatus;
}
