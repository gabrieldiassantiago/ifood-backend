import { Elysia, t } from "elysia";
import { ProductService } from "./product.service";
import { ProductModel, CreateProductInput, UpdateProductInput } from "./product.model";
import { adminGuard } from "../../middlewares/auth.middleware";

const service = new ProductService();

export const products = new Elysia({ prefix: "/products" })
  // Rotas públicas
  .get(
    "/",
    async () => {
      return service.getAllProducts();
    },
    {
      detail: {
        tags: ["Products"],
        summary: "Listar todos os produtos",
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
        security: [{ bearerAuth: [] }],
      },
    }
  );
