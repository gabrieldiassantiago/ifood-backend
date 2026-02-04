import { Elysia, t } from "elysia";
import { ProductService } from "./product.service";
import { 
  ProductModel, 
  CreateProductInput, 
  UpdateProductInput,
  ProductResponseSchema,
  CreateProductSchema,
  UpdateProductSchema,
  ErrorResponseSchema
} from "./product.model";
import { cache } from '@nowarajs/elysia-cache'
import z from "zod";
import { authMacro } from "../../middlewares/auth.macro";

const service = new ProductService();

export const products = new Elysia({ prefix: "/products" })

  .use(cache())
  .use(authMacro)

  .get(
    "/",
    async () => service.getActiveProducts(),
    {
      isCached: { ttl: 240 }, // 4 minutos de cache
      detail: {
        tags: ["Products"],
        summary: "Listar produtos ativos",
        description:
          "Retorna a lista de produtos com categorias ativas, disponíveis para visualização pública.",
      },
    },
  )

  .get(
    "/:id",
    async ({ params }: { params: { id: string } }) => {
      return await service.getProductById(params.id);
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      detail: {
        tags: ["Products"],
        summary: "Buscar produto por ID",
        description: "Retorna os detalhes completos de um produto específico pelo seu ID.",
      },
    }
  )

  .get(
    "/all",
    async () => {
      return service.getAllProducts();
    },
    {
      isAdmin: true,
      response: {
        200: z.array(ProductResponseSchema),
      },
      detail: {
        tags: ["Products"],
        summary: "Listar todos os produtos (Admin)",
        description: "Retorna todos os produtos, incluindo os de categorias inativas. Requer autenticação de administrador.",
      },
    }
  )
  
  .post(
    "/",
    async ({ body }: { body: CreateProductInput }) => {
      return await service.createProduct(body);
    },
    {
      isAdmin: true,
      body: CreateProductSchema,
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
    }: {
      params: { id: string };
      body: UpdateProductInput;
    }) => {
      return await service.updateProduct(params.id, body);
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      body: UpdateProductSchema,
      response: {
        200: ProductResponseSchema,
        400: ErrorResponseSchema,
      },
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
    async ({ params }: { params: { id: string } }) => {
      return await service.toggleAvailability(params.id);
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      response: {
        200: ProductResponseSchema,
        404: ErrorResponseSchema,
      },
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
    async ({ params }: { params: { id: string } }) => {
      await service.deleteProduct(params.id);
      return { message: "Product deleted successfully" };
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      response: {
        200: t.Object({ message: t.String() }),
        404: ErrorResponseSchema,
      },
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
    async ({ params, body }: { params: { id: string }; body: any }) => {
      return await service.addAddon(params.id, body);
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      body: t.Object({
        name: t.String({ description: "Nome do adicional" }),
        price: t.Number({ minimum: 0.01, description: "Preço do adicional" }),
      }),
      response: {
        200: t.Any(),
        400: ErrorResponseSchema,
      },
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
    async ({ params }: { params: { id: string } }) => {
      return await service.getProductAddons(params.id);
    },
    {
      params: t.Object({
        id: t.String({ description: "ID do produto" }),
      }),
      response: {
        200: t.Any(),
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Listar addons de produto",
        description: "Retorna todos os adicionais/complementos disponíveis para um produto específico.",
      },
    }
  )

  .patch(
    "/addons/:addonId",
    async ({ params, body }: { params: { addonId: string }; body: any }) => {
      return await service.updateAddon(params.addonId, body);
    },
    {
      params: t.Object({
        addonId: t.String({ description: "ID do adicional" }),
      }),
      body: t.Object({
        name: t.Optional(t.String({ description: "Nome do adicional" })),
        price: t.Optional(t.Number({ minimum: 0.01, description: "Preço do adicional" })),
        isActive: t.Optional(t.Boolean({ description: "Status de ativação" })),
      }),
      response: {
        200: t.Any(),
        400: ErrorResponseSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Atualizar addon (Admin)",
        description: "Atualiza as informações de um adicional/complemento. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/addons",
    async () => {
      return service.getAllAddons();
    },
    {
      response: {
        200: t.Any(),
      },
      detail: {
        tags: ["Products"],
        summary: "Listar todos os addons",
        description: "Retorna todos os adicionais/complementos disponíveis no sistema.",
      },
    }
  )

  .delete(
    "/addons/:addonId",
    async ({ params }: { params: { addonId: string } }) => {
      await service.deleteAddon(params.addonId);
      return { message: "Addon deleted successfully" };
    },
    {
      params: t.Object({
        addonId: t.String({ description: "ID do adicional" }),
      }),
      response: {
        200: t.Object({ message: t.String() }),
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Products"],
        summary: "Deletar addon (Admin)",
        description: "Remove um adicional/complemento permanentemente. Requer autenticação de administrador.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
