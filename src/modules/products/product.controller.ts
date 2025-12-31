import { Elysia, t } from "elysia";
import { ProductService } from "./product.service";
import { ProductModel, CreateProductInput, UpdateProductInput } from "./product.model";
import { adminGuard } from "../../middlewares/auth.middleware";

const service = new ProductService();

export const products = new Elysia({ prefix: "/products" })

.get(
    "/",
    async () => {
      return service.getAllProducts();
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Listar todos os produtos",
        description: "Retorna a lista completa de produtos disponíveis, incluindo informações de categoria, preço e disponibilidade.",
      },
    }
  )

  .get(
    "/:id",
    async ({ params, set }: { params: { id: string }; set: any }) => {
      try {
        return await service.getProductById(params.id);
      } catch (error) {
        set.status = 404;
        return {
          message: error instanceof Error ? error.message : "Product not found",
        };
      }
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Buscar produto por ID",
        description: "Retorna os detalhes completos de um produto específico pelo seu ID.",
      },
    }
  )

  .use(adminGuard)
  
  .post(
    "/",
    async ({ body, set }: { body: CreateProductInput; set: any }) => {
      try {
        return await service.createProduct(body);
      } catch (error) {
        set.status = 400;
        return {
          message: error instanceof Error ? error.message : "Failed to create",
        };
      }
    },
    {
      body: ProductModel.create,
      detail: {
        tags: ["Products"],
        summary: "Criar produto (Admin)",
        description: "Cria um novo produto no catálogo. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id",
    async ({
      params,
      body,
      set,
    }: {
      params: { id: string };
      body: UpdateProductInput;
      set: any;
    }) => {
      try {
        return await service.updateProduct(params.id, body);
      } catch (error) {
        set.status = 400;
        return {
          message: error instanceof Error ? error.message : "Failed to update",
        };
      }
    },
    {
      body: ProductModel.update,
      detail: {
        tags: ["Products"],
        summary: "Atualizar produto (Admin)",
        description: "Atualiza as informações de um produto existente. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id/toggle",
    async ({ params, set }: { params: { id: string }; set: any }) => {
      try {
        return await service.toggleAvailability(params.id);
      } catch (error) {
        set.status = 404;
        return {
          message: error instanceof Error ? error.message : "Product not found",
        };
      }
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Toggle disponibilidade (Admin)",
        description: "Alterna o status de disponibilidade de um produto (disponível/indisponível). Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/:id",
    async ({ params, set }: { params: { id: string }; set: any }) => {
      try {
        await service.deleteProduct(params.id);
        return { message: "Product deleted successfully" };
      } catch (error) {
        set.status = 404;
        return {
          message: error instanceof Error ? error.message : "Product not found",
        };
      }
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Deletar produto (Admin)",
        description: "Remove um produto do catálogo permanentemente. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/:id/addons",
    async ({ params, body, set }: { params: { id: string }; body: any; set: any }) => {
      try {
        return await service.addAddon(params.id, body);
      } catch (error) {
        set.status = 400;
        return {
          message: error instanceof Error ? error.message : "Failed to create addon",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        price: t.Number({ minimum: 0.01 }),
      }),
      detail: {
        tags: ["Products"],
        summary: "Adicionar addon a produto (Admin)",
        description: "Adiciona um novo adicional/complemento a um produto específico. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/:id/addons",
    async ({ params, set }: { params: { id: string }; set: any }) => {
      try {
        return await service.getProductAddons(params.id);
      } catch (error) {
        set.status = 404;
        return {
          message: error instanceof Error ? error.message : "Product not found",
        };
      }
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Listar addons de produto",
        description: "Retorna todos os adicionais/complementos disponíveis para um produto específico.",
      },
    }
  )

  .patch(
    "/addons/:addonId",
    async ({ params, body, set }: { params: { addonId: string }; body: any; set: any }) => {
      try {
        return await service.updateAddon(params.addonId, body);
      } catch (error) {
        set.status = 400;
        return {
          message: error instanceof Error ? error.message : "Failed to update addon",
        };
      }
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        price: t.Optional(t.Number({ minimum: 0.01 })),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Products"],
        summary: "Atualizar addon (Admin)",
        description: "Atualiza as informações de um adicional/complemento. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/addons/:addonId",
    async ({ params, set }: { params: { addonId: string }; set: any }) => {
      try {
        await service.deleteAddon(params.addonId);
        return { message: "Addon deleted successfully" };
      } catch (error) {
        set.status = 404;
        return {
          message: error instanceof Error ? error.message : "Addon not found",
        };
      }
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Deletar addon (Admin)",
        description: "Remove um adicional/complemento permanentemente. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
