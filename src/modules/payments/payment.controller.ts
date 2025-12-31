import { Elysia, t } from "elysia";
import { PaymentService } from "./payment.service";
import { authMiddleware } from "../../middlewares/auth.middleware";

const paymentService = new PaymentService();

export const payments = new Elysia({ prefix: "/payments" })

.post(
    "/webhook",
    async ({ body }) => {
      const result = await paymentService.handleWebhook(body);
      return {
        success: true,
        data: result,
      };
    },
    {
      body: t.Any(),
      detail: {
        tags: ["Payments"],
        summary: "Webhook do Mercado Pago",
        description: "Endpoint para receber notificações de atualização de status de pagamento do Mercado Pago. Não requer autenticação.",
      },
    }
  )
  
  .use(authMiddleware)
  
  // Criar pagamento PIX
  .post(
    "/pix",
    async ({ body, user }: any) => {
      try {
        const pixData = await paymentService.createPixPayment({
          orderId: body.orderId,
          amount: body.amount,
          paymentMethod: "PIX",
          description: body.description,
          userEmail: user.email,
        });

        return {
          success: true,
          data: pixData,
        };
      } catch (error) {
        throw error;
      }
    },
    {
      body: t.Object({
        orderId: t.String(),
        amount: t.Number(),
        description: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Criar pagamento PIX",
        description: "Cria um novo pagamento PIX via Mercado Pago e retorna o QR Code e código copia-e-cola.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Buscar pagamento por ID
  .get(
    "/:id",
    async ({ params }: any) => {
      const payment = await paymentService.getPaymentById(params.id);
      return {
        success: true,
        data: payment,
      };
    },
    {
      detail: {
        tags: ["Payments"],
        summary: "Buscar pagamento por ID",
        description: "Retorna os detalhes de um pagamento específico.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Buscar pagamento por ID do pedido
  .get(
    "/order/:orderId",
    async ({ params }: any) => {
      const payment = await paymentService.getPaymentByOrderId(params.orderId);
      return {
        success: true,
        data: payment,
      };
    },
    {
      detail: {
        tags: ["Payments"],
        summary: "Buscar pagamento por ID do pedido",
        description: "Retorna o pagamento associado a um pedido específico.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Verificar status do pagamento
  .get(
    "/status/:paymentId",
    async ({ params }: any) => {
      const status = await paymentService.checkPaymentStatus(params.paymentId);
      return {
        success: true,
        data: status,
      };
    },
    {
      detail: {
        tags: ["Payments"],
        summary: "Verificar status do pagamento",
        description: "Consulta o status atual de um pagamento no Mercado Pago (pending, approved, rejected, etc).",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Listar todos os pagamentos
  .get(
    "/",
    async ({ user }: any) => {
      const payments = await paymentService.getAllPayments();
      return {
        success: true,
        data: payments,
      };
    },
    {
      detail: {
        tags: ["Payments"],
        summary: "Listar todos os pagamentos",
        description: "Retorna a lista de todos os pagamentos registrados no sistema.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Reembolsar pagamento
  .post(
    "/refund",
    async ({ body }: any) => {
      const refund = await paymentService.refundPayment({
        paymentId: body.paymentId,
        amount: body.amount,
      });
      
      return {
        success: true,
        data: refund,
        message: "Reembolso realizado com sucesso",
      };
    },
    {
      body: t.Object({
        paymentId: t.String(),
        amount: t.Optional(t.Number({ 
          description: "Valor do reembolso. Se não informado, reembolsa o valor total" 
        })),
      }),
      detail: {
        tags: ["Payments"],
        summary: "Reembolsar pagamento PIX",
        description: "Cria um reembolso total ou parcial de um pagamento PIX aprovado. O pedido será automaticamente cancelado.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
