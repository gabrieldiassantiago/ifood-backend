import { t } from "elysia";

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
    imageUrl: t.Optional(t.String()),
    categoryId: t.String(),
    isAvailable: t.Optional(t.Boolean()),
  }),

  update: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    price: t.Optional(t.Number()),
    imageUrl: t.Optional(t.String()),
    categoryId: t.Optional(t.String()),
    isAvailable: t.Optional(t.Boolean()),
  }),

  errorResponse: t.Object({
    message: t.String(),
  }),
};

export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;
