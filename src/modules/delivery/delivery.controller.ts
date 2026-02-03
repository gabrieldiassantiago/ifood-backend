import { Elysia, t } from "elysia";
import { DeliveryService } from "./delivery.service";
import { authMacro } from "../../middlewares/auth.macro";

const service = new DeliveryService();

export const deliveryFees = new Elysia({ prefix: "/delivery-fees" })
  
  .get(
    "/districts",
    async () => {
      const districts = await service.getActiveDistricts();
      return {
        data: districts,
      };
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Listar bairros disponíveis",
        description: "Retorna a lista de bairros com entrega disponível e suas respectivas taxas.",
      },
    }
  )

  .get(
    "/districts/:district",
    async ({ params }: any) => {
      const deliveryFee = await service.getFeeByDistrict(params.district);
      return {
        success: true,
        data: deliveryFee,
      };
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Buscar taxa de entrega",
        description: "Retorna a taxa de entrega para um bairro específico.",
      },
    }
  )

  .use(authMacro)

  .get(
    "/",
    async () => {
      const districts = await service.getAllDistricts();
      return {
        success: true,
        data: districts,
      };
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Listar todos os bairros (Admin)",
        description: "Retorna todos os bairros cadastrados, incluindo inativos.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Criar novo bairro (admin)
  .post(
    "/",
    async ({ body }: any) => {
      const deliveryFee = await service.createDistrict(body);
      return {
        success: true,
        data: deliveryFee,
      };
    },
    {
      isAdmin: true,
      body: t.Object({
        district: t.String({ minLength: 1 }),
        price: t.Number({ minimum: 0 }),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Delivery"],
        summary: "Criar novo bairro (Admin)",
        description: "Cadastra um novo bairro com taxa de entrega.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id",
    async ({ params, body }: any) => {
      const deliveryFee = await service.updateDistrict(params.id, body);
      return {
        success: true,
        data: deliveryFee,
      };
    },
    {
      isAdmin: true,
      body: t.Object({
        district: t.Optional(t.String({ minLength: 1 })),
        price: t.Optional(t.Number({ minimum: 0 })),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Delivery"],
        summary: "Atualizar bairro (Admin)",
        description: "Atualiza os dados de um bairro existente.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id/toggle",
    async ({ params }: any) => {
      const updated = await service.toggleDistrictStatus(params.id);
      return {
        success: true,
        data: updated,
      };
    },
    
    {
      isAdmin: true,
      detail: {
        tags: ["Delivery"],
        summary: "Alternar status do bairro (Admin)",
        description: "Ativa ou desativa um bairro de entrega.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/:id",
    async ({ params }: any) => {
      await service.deleteDistrict(params.id);
      return {
        success: true,
        message: "Bairro deletado com sucesso",
      };
    },
    {
      isAdmin: true,
      detail: {
        tags: ["Delivery"],
        summary: "Deletar bairro (Admin)",
        description: "Remove um bairro do sistema.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
