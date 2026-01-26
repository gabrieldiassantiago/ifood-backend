import { t } from "elysia";
import { z } from "zod";

export const ProductResponseSchema = z.object({
  id: z.string().describe("ID único do produto"),
  name: z.string().describe("Nome do produto"),
  description: z.string().nullable().describe("Descrição detalhada do produto"),
  price: z.number().positive().describe("Preço do produto em reais"),
  imageUrl: z.string().url().nullable().describe("URL da imagem do produto"),
  isAvailable: z.boolean().describe("Indica se o produto está disponível para venda"),
  categoryId: z.string().describe("ID da categoria do produto"),
  createdAt: z.date().describe("Data de criação do produto"),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").describe("Nome do produto"),
  description: z.string().optional().describe("Descrição do produto"),
  price: z.number().positive("Preço deve ser maior que zero").describe("Preço do produto em reais"),
  imageUrl: z.string().url("URL inválida").nullable().optional().describe("URL da imagem do produto"),
  categoryId: z.string().min(1, "Categoria é obrigatória").describe("ID da categoria do produto"),
  isAvailable: z.boolean().default(true).optional().describe("Disponibilidade do produto (padrão: true)"),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional().describe("Nome do produto"),
  description: z.string().optional().describe("Descrição do produto"),
  price: z.number().positive().optional().describe("Preço do produto em reais"),
  imageUrl: z.string().url().nullable().optional().describe("URL da imagem do produto"),
  categoryId: z.string().optional().describe("ID da categoria do produto"),
  isAvailable: z.boolean().optional().describe("Disponibilidade do produto"),
});

export const ErrorResponseSchema = z.object({
  message: z.string().describe("Mensagem de erro"),
});

export const ProductModel = {
  response: t.Object({
    id: t.String(),
    name: t.String(),
    description: t.Nullable(t.String()),
    price: t.Number(),
    imageUrl: t.Nullable(t.String()),
    isAvailable: t.Boolean(),
    categoryId: t.String(),
    createdAt: t.Date(),
  }),

  create: t.Object({
    name: t.String(),
    description: t.Optional(t.String()),
    price: t.Number(),
    imageUrl: t.Optional(t.Nullable(t.String())),
    categoryId: t.String(),
    isAvailable: t.Optional(t.Boolean()),
  }),

  update: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    price: t.Optional(t.Number()),
    imageUrl: t.Optional(t.Nullable(t.String())),
    categoryId: t.Optional(t.String()),
    isAvailable: t.Optional(t.Boolean()),
  }),

  errorResponse: t.Object({
    message: t.String(),
  }),
};

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;

