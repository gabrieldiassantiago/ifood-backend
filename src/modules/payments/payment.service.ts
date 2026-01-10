import { getMercadoPagoClient, getMercadoPagoRefundClient } from "../../config/mercadopago.config";
import { PaymentRepository } from "./payment.repository";
import { CreatePaymentInput, PaymentPixData, RefundPaymentInput, RefundPaymentResponse } from "./payment.types";
import { PaymentMethod, PaymentStatus, OrderStatus } from "../../../generated/prisma/enums";
import { 
  PaymentNotFoundError, 
  PaymentAlreadyExistsError,
  MercadoPagoError,
  InvalidPaymentMethodError 
} from "./errors/payment.errors";
import { prisma } from "../../../prisma/db";
import { OrderService } from "../orders/order.service";

export class PaymentService {
  constructor(
    private repository: PaymentRepository = new PaymentRepository(),
  ) {}

  async createPixPayment(data: CreatePaymentInput): Promise<PaymentPixData> {

    const existingPayment = await this.repository.findByOrderId(data.orderId);
    
    if (existingPayment) {
      throw new PaymentAlreadyExistsError(data.orderId);
    }

    if (data.paymentMethod !== PaymentMethod.PIX) {
      throw new InvalidPaymentMethodError();
    }

    try {

      const paymentClient = getMercadoPagoClient();
      
      const response = await paymentClient.create({
        body: {
          transaction_amount: data.amount,
          description: data.description || "Pedido iFood",
          payment_method_id: "pix",
          payer: {
            email: data.userEmail || "user@example.com",
          },
          external_reference: data.orderId,
        }
      });

      if (!response.id) {
        throw new MercadoPagoError("Falha ao criar pagamento PIX");
      }

      const pixData = response.point_of_interaction?.transaction_data;
      
      if (!pixData?.qr_code || !pixData?.qr_code_base64) {
        throw new MercadoPagoError("QR Code PIX não disponível");
      }

      await this.repository.create({
        orderId: data.orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        paymentId: response.id.toString(),
        qrCode: pixData.qr_code,
        qrCodeBase64: pixData.qr_code_base64,
        ticketUrl: pixData.ticket_url,
      });

      return {
        qrCode: pixData.qr_code,
        qrCodeBase64: pixData.qr_code_base64,
        paymentId: response.id.toString(),
        ticketUrl: pixData.ticket_url,
      };

    } catch (error) {
      if (error instanceof PaymentAlreadyExistsError || error instanceof MercadoPagoError) {
        throw error;
      }
      throw new MercadoPagoError((error as Error).message);
    }
  }

  async getPaymentById(id: string) {
    const payment = await this.repository.findById(id);
    
    if (!payment) {
      throw new PaymentNotFoundError(id);
    }

    return payment;
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.repository.findByOrderId(orderId);
    
    if (!payment) {
      throw new PaymentNotFoundError(orderId);
    }

    return payment;
  }

  async checkPaymentStatus(paymentId: string) {
    try {
      const paymentClient = getMercadoPagoClient();
      const response = await paymentClient.get({ id: paymentId });
      
      const mercadoPagoStatus = response.status;
      
      let internalStatus: PaymentStatus;

      switch (mercadoPagoStatus) {
        case "approved":
          internalStatus = PaymentStatus.APPROVED;
          break;
        case "rejected":
          internalStatus = PaymentStatus.REJECTED;
          break;
        case "cancelled":
          internalStatus = PaymentStatus.CANCELLED;
          break;
        case "refunded":
          internalStatus = PaymentStatus.REFUNDED;
          break;
        default:
          internalStatus = PaymentStatus.PENDING;
      }

      const payment = await this.repository.updateStatus(paymentId, internalStatus);
      
      // Confirmar o pedido quando o pagamento for aprovado
      if (internalStatus === PaymentStatus.APPROVED && payment) {
        const orderService = new OrderService();
        
        try {
          // Confirmar pagamento PIX e mudar status do pedido para CREATED
          await orderService.confirmPixPayment(payment.orderId);
        } catch (error) {
          console.error('Erro ao confirmar pedido PIX:', error);
        }
      }
      
      return {
        status: internalStatus,
        mercadoPagoStatus,
        payment,
      };
    } catch (error) {
      throw new MercadoPagoError((error as Error).message);
    }
  }

  async handleWebhook(webhookData: any) {
    try {
      if (webhookData.type === "payment") {
        const paymentId = webhookData.data.id.toString();
        return await this.checkPaymentStatus(paymentId);
      }
      
      return null;
    } catch (error) {
      throw new MercadoPagoError((error as Error).message);
    }
  }

  async getAllPayments() {
    return this.repository.findAll();
  }

  async refundPayment(data: RefundPaymentInput): Promise<RefundPaymentResponse> {
    try {

      const payment = await this.repository.findByPaymentId(data.paymentId);
      
      
      if (!payment) {
        throw new PaymentNotFoundError(data.paymentId);
      }

      // Verifica se já foi reembolsado
      if (payment.status === PaymentStatus.REFUNDED) {
        throw new MercadoPagoError("Pagamento já foi reembolsado");
      }

      // Verifica se o pagamento está aprovado
      if (payment.status !== PaymentStatus.APPROVED) {
        throw new MercadoPagoError("Só é possível reembolsar pagamentos aprovados");
      }
    
      const refundClient = getMercadoPagoRefundClient();
      
      // Cria o reembolso no Mercado Pago
      const refundAmount = data.amount || payment.amount;
            
      const response = await refundClient.create({
        payment_id: data.paymentId,
        body: {
          amount: refundAmount,
        }
      });

      if (!response.id) {
        throw new MercadoPagoError("Falha ao criar reembolso");
      }

      await this.repository.updateStatus(data.paymentId, PaymentStatus.REFUNDED);

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED }
      });

      return {
        refundId: response.id.toString(),
        status: response.status || "approved",
        amount: refundAmount,
        paymentId: data.paymentId,
      };
      
    } catch (error) {
      if (error instanceof PaymentNotFoundError || error instanceof MercadoPagoError) {
        throw error;
      }
      throw new MercadoPagoError((error as Error).message);
    }
  }
}
