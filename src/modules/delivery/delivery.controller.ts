import { Elysia, t } from "elysia";
import { adminGuard } from "../../middlewares/auth.middleware";
import { DeliveryService } from "./delivery.service";

const service = new DeliveryService();

export const deliveryFees = new Elysia({ prefix: "/delivery-fees" })
  
  // Listar todos os bairros (público)
  .get(
    "/districts",
    async () => {
      try {
        const districts = await service.getActiveDistricts();
        return {
          success: true,
          data: districts,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao buscar bairros",
        };
      }
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Listar bairros disponíveis",
        description: "Retorna a lista de bairros com entrega disponível e suas respectivas taxas.",
      },
    }
  )

  // Buscar taxa de entrega por bairro (público)
  .get(
    "/districts/:district",
    async ({ params, set }: any) => {
      try {
        const deliveryFee = await service.getFeeByDistrict(params.district);
        return {
          success: true,
          data: deliveryFee,
        };
      } catch (error) {
        set.status = 404;
        return {
          success: false,
          message: error instanceof Error ? error.message : "Erro ao buscar taxa",
        };
      }
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Buscar taxa de entrega",
        description: "Retorna a taxa de entrega para um bairro específico.",
      },
    }
  )

  // Aplicar guard de admin para rotas administrativas
  .use(adminGuard)

  // Listar todos os bairros (admin)
  .get(
    "/",
    async ({ set }: any) => {
      try {
        const districts = await service.getAllDistricts();
        return {
          success: true,
          data: districts,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao buscar bairros",
        };
      }
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
    async ({ body, set }: any) => {
      try {
        const deliveryFee = await service.createDistrict(body);
        return {
          success: true,
          data: deliveryFee,
        };
      } catch (error) {
        set.status = 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao criar bairro",
        };
      }
    },
    {
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

  // Atualizar bairro (admin)
  .patch(
    "/:id",
    async ({ params, body, set }: any) => {
      try {
        const deliveryFee = await service.updateDistrict(params.id, body);
        return {
          success: true,
          data: deliveryFee,
        };
      } catch (error) {
        set.status = error instanceof Error && error.message === "Bairro não encontrado" ? 404 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao atualizar bairro",
        };
      }
    },
    {
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

  // Alternar status do bairro (admin)
  .patch(
    "/:id/toggle",
    async ({ params, set }: any) => {
      try {
        const updated = await service.toggleDistrictStatus(params.id);
        return {
          success: true,
          data: updated,
        };
      } catch (error) {
        set.status = error instanceof Error && error.message === "Bairro não encontrado" ? 404 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao atualizar status",
        };
      }
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Alternar status do bairro (Admin)",
        description: "Ativa ou desativa um bairro de entrega.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Deletar bairro (admin)
  .delete(
    "/:id",
    async ({ params, set }: any) => {
      try {
        await service.deleteDistrict(params.id);
        return {
          success: true,
          message: "Bairro deletado com sucesso",
        };
      } catch (error) {
        set.status = error instanceof Error && error.message === "Bairro não encontrado" ? 404 : 400;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erro ao deletar bairro",
        };
      }
    },
    {
      detail: {
        tags: ["Delivery"],
        summary: "Deletar bairro (Admin)",
        description: "Remove um bairro do sistema.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
