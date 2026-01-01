import { Elysia, t } from "elysia";
import { OrderService } from "./order.service";
import { PaymentService } from "../payments/payment.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { OrderStatus, PaymentMethod } from "../../../generated/prisma/enums";

const orderService = new OrderService();
const paymentService = new PaymentService();

export const orders = new Elysia({ prefix: "/orders" })
  .use(authMiddleware)
  
  // Criar pedido (sem pagamento - para CASH, CREDIT_CARD, DEBIT_CARD)
  .post(
    "/",
    async ({ body, user }: any) => {
      const order = await orderService.createOrder({
        userId: user.id,
        addressId: body.addressId,
        deliveryDistrict: body.deliveryDistrict,
        paymentMethod: body.paymentMethod,
        changeFor: body.changeFor,
        observation: body.observation,
        items: body.items,
      });

      return {
        success: true,
        data: order,
      };
    },
    {
      body: t.Object({
        addressId: t.String(),
        deliveryDistrict: t.String(),
        paymentMethod: t.Enum(PaymentMethod),
        changeFor: t.Optional(t.Number()),
        observation: t.Optional(t.String()),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            addons: t.Optional(
              t.Array(
                t.Object({
                  name: t.String(),
                  price: t.Number(),
                })
              )
            ),
          })
        ),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Criar pedido",
        description: "Cria um novo pedido com pagamento em dinheiro, cartão de crédito ou débito. Para PIX, use a rota /orders/with-pix.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Criar pedido com PIX (cria pedido + pagamento)
  .post(
    "/with-pix",
    async ({ body, user }: any) => {
      // 1. Criar o pedido
      const order = await orderService.createOrder({
        userId: user.id,
        addressId: body.addressId,
        deliveryDistrict: body.deliveryDistrict,
        paymentMethod: PaymentMethod.PIX,
        observation: body.observation,
        items: body.items,
      });

      // 2. Criar o pagamento PIX
      const pixData = await paymentService.createPixPayment({
        orderId: order.id,
        amount: order.total,
        paymentMethod: PaymentMethod.PIX,
        description: `Pedido #${order.id}`,
        userEmail: user.email,
      });

      return {
        success: true,
        data: {
          order,
          payment: pixData,
        },
      };
    },
    {
      body: t.Object({
        addressId: t.String(),
        deliveryDistrict: t.String(),
        observation: t.Optional(t.String()),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            addons: t.Optional(
              t.Array(
                t.Object({
                  name: t.String(),
                  price: t.Number(),
                })
              )
            ),
          })
        ),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Criar pedido com PIX",
        description: "Cria um pedido e gera um pagamento PIX via Mercado Pago. Retorna o QR Code e código PIX para pagamento.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Calcular resumo do pedido (antes de criar)
  .post(
    "/calculate",
    async ({ body }: any) => {
      const summary = await orderService.calculateOrderSummary(
        body.items,
        body.deliveryDistrict
      );

      return {
        success: true,
        data: summary,
      };
    },
    {
      body: t.Object({
        deliveryDistrict: t.String(),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number(),
            addons: t.Optional(
              t.Array(
                t.Object({
                  price: t.Number(),
                })
              )
            ),
          })
        ),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Calcular resumo do pedido",
        description: "Calcula o valor total do pedido incluindo taxa de entrega antes de finalizar a compra.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Buscar pedido por ID
  .get(
    "/:id",
    async ({ params, user }: any) => {
      const order = await orderService.getOrderById(params.id);
      
      // Usuários comuns só podem ver seus próprios pedidos
      if (user.role !== "ADMIN" && order.userId !== user.id) {
        throw new Error("Acesso negado");
      }

      return {
        success: true,
        data: order,
      };
    },
    {
      detail: {
        tags: ["Orders"],
        summary: "Buscar pedido por ID",
        description: "Retorna os detalhes completos de um pedido específico. Usuários comuns só podem ver seus próprios pedidos.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Listar pedidos do usuário
  .get(
    "/user/me",
    async ({ user }: any) => {
      const orders = await orderService.getOrdersByUserId(user.id);
      return {
        success: true,
        data: orders,
      };
    },
    {
      detail: {
        tags: ["Orders"],
        summary: "Listar meus pedidos",
        description: "Retorna todos os pedidos do usuário autenticado.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Listar todos os pedidos (apenas admin)
  .get(
    "/",
    async ({ user }: any) => {
      if (user.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      const orders = await orderService.getAllOrders();
      return {
        success: true,
        data: orders,
      };
    },
    {
      detail: {
        tags: ["Orders"],
        summary: "Listar todos os pedidos (Admin)",
        description: "Retorna todos os pedidos do sistema. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Listar pedidos por status (apenas admin)
  .get(
    "/status/:status",
    async ({ params, user }: any) => {
      if (user.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      const orders = await orderService.getOrdersByStatus(params.status as OrderStatus);
      return {
        success: true,
        data: orders,
      };
    },
    {
      detail: {
        tags: ["Orders"],
        summary: "Listar pedidos por status (Admin)",
        description: "Retorna todos os pedidos com um determinado status (PENDING, CONFIRMED, PREPARING, etc). Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Atualizar status do pedido (apenas admin)
  .patch(
    "/:id/status",
    async ({ params, body, user }: any) => {
      if (user.role !== "ADMIN") {
        throw new Error("Acesso negado");
      }

      const order = await orderService.updateOrderStatus(params.id, body.status);
      return {
        success: true,
        data: order,
      };
    },
    {
      body: t.Object({
        status: t.Enum(OrderStatus),
      }),
      detail: {
        tags: ["Orders"],
        summary: "Atualizar status do pedido (Admin)",
        description: "Atualiza o status de um pedido (ex: PENDING -> CONFIRMED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED). Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Cancelar pedido
  .delete(
    "/:id",
    async ({ params, user }: any) => {
      const order = await orderService.getOrderById(params.id);
      
      // Apenas o usuário dono do pedido ou admin pode cancelar
      if (user.role !== "ADMIN" && order.userId !== user.id) {
        throw new Error("Acesso negado");
      }

      const cancelledOrder = await orderService.cancelOrder(params.id);
      return {
        success: true,
        data: cancelledOrder,
      };
    },
    {
      detail: {
        tags: ["Orders"],
        summary: "Cancelar pedido",
        description: "Cancela um pedido. Usuários podem cancelar apenas seus próprios pedidos, administradores podem cancelar qualquer pedido.",
        security: [{ bearerAuth: [] }],
      },
    }
  )
