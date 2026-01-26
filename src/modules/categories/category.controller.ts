import { Elysia, t } from "elysia";
import { CategoryService } from "./category.service";
import { authMacro } from "../../middlewares/auth.macro";

const service = new CategoryService();

export const categories = new Elysia({ prefix: "/categories" })

  .use(authMacro)

  .get(
    "/",
    async () => {
      const categories = await service.getAllCategories();
      return { success: true, data: categories };
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "Listar todas as categorias",
        description: "Retorna uma lista de todas as categorias cadastradas",
      },
    }
  )

  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const category = await service.getCategoryById(id);
        return { success: true, data: category };
      } catch (error) {
        set.status = 404;
        return { success: false, error: error instanceof Error ? error.message : "Categoria não encontrada" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Buscar categoria por ID",
        description: "Retorna os detalhes de uma categoria específica",
      },
    }
  )

  .post(
    "/",
    async ({ body, set }) => {
      try {
        const category = await service.createCategory(body);
        set.status = 201;
        return { success: true, data: category };
      } catch (error) {
        set.status = 400;
        return { success: false, error: error instanceof Error ? error.message : "Erro ao criar categoria" };
      }
    },
    {
      isAdmin: true,
      body: t.Object({
        name: t.String({ minLength: 1 }),
        order: t.Optional(t.Number()),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Criar nova categoria",
        description: "Cria uma nova categoria de produtos",
      },
    }
  )

  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        const category = await service.updateCategory(id, body);
        return { success: true, data: category };
      } catch (error) {
        set.status = 400;
        return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar categoria" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      isAdmin: true,
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        order: t.Optional(t.Number()),
        isActive: t.Optional(t.Boolean()),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Atualizar categoria",
        description: "Atualiza os dados de uma categoria existente",
      },
    }
  )

  .patch(
    "/:id/toggle",
    async ({ params: { id }, set }) => {
      try {
        const category = await service.toggleCategoryActive(id);
        return { success: true, data: category };
      } catch (error) {
        set.status = 400;
        return { success: false, error: error instanceof Error ? error.message : "Erro ao atualizar categoria" };
      }
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Alternar status da categoria",
        description: "Ativa ou desativa uma categoria",
      },
    }
  )

  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        await service.deleteCategory(id);
        return { success: true, message: "Categoria deletada com sucesso" };
      } catch (error) {
        set.status = 400;
        return { success: false, error: error instanceof Error ? error.message : "Erro ao deletar categoria" };
      }
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Categories"],
        summary: "Deletar categoria",
        description: "Remove uma categoria do sistema (apenas se não tiver produtos associados)",
      },
    }
  );
