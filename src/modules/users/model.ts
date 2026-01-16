import { t } from "elysia"
import { z } from "zod"
import { Role } from "../../../generated/prisma/client"

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").describe("Nome completo do usuário"),
  phone: z.string().regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos").describe("Número de telefone (apenas dígitos)"),
  email: z.string().email("Email inválido").optional().describe("Email do usuário (opcional)"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").describe("Senha do usuário"),
})

export const LoginSchema = z.object({
  phone: z.string().describe("Número de telefone cadastrado"),
  password: z.string().describe("Senha do usuário"),
})

export const UserResponseSchema = z.object({
  id: z.string().describe("ID único do usuário"),
  name: z.string().describe("Nome completo do usuário"),
  phone: z.string().describe("Número de telefone"),
  email: z.string().nullable().describe("Email do usuário"),
  role: z.nativeEnum(Role).describe("Papel do usuário (USER, ADMIN, DELIVERY)"),
  createdAt: z.date().describe("Data de criação da conta"),
})

export const ErrorResponseSchema = z.object({
  message: z.string().describe("Mensagem de erro"),
})

export const UsersModel = {
  create: t.Object({
    name: t.String(),
    phone: t.String(),
    email: t.Optional(t.String({ format: "email" })),
    password: t.String({ minLength: 6 }),
    role: t.Optional(t.Enum(Role)),
  }),

  login: t.Object({
    phone: t.String(),
    password: t.String(),
  }),

  response: t.Object({
    id: t.String(),
    name: t.String(),
    phone: t.String(),
    email: t.Nullable(t.String()),
    role: t.Enum(Role),
    createdAt: t.Date(),
  }),

  errorResponse: t.Object({
    message: t.String(),
  }),
}

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>