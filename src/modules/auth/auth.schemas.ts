import { z } from "zod"

export const LoginByPhoneSchema = z.object({
  phone: z.string()
    .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
    .describe("Número de telefone (apenas dígitos)"),
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .describe("Senha do usuário"),
})

export const LoginAdminSchema = z.object({
  email: z.string()
    .email("Email inválido")
    .describe("Email do administrador"),
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .describe("Senha do administrador"),
})

export const AuthResponseSchema = z.object({
  token: z.string().describe("Token JWT para autenticação")
})

export const AuthErrorSchema = z.object({
  error: z.string().describe("Mensagem de erro"),
})

export type LoginByPhoneInput = z.infer<typeof LoginByPhoneSchema>
export type LoginAdminInput = z.infer<typeof LoginAdminSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
