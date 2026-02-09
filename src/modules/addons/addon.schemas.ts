import { z } from "zod";

export const CreateAddonSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  productId: z.string().uuid("ID do produto inválido"),
});

export const AddonResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  productId: z.string(),
});

export const AddonsListResponseSchema = z.array(AddonResponseSchema);

export const AddonErrorSchema = z.object({
  error: z.string().describe("Mensagem de erro"),
});

export type CreateAddonInput = z.infer<typeof CreateAddonSchema>;
export type AddonResponse = z.infer<typeof AddonResponseSchema>;
