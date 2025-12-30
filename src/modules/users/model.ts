import { t } from "elysia"
import { Role } from "../../../generated/prisma/client"

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

export type CreateUserInput = typeof UsersModel.create.static
export type LoginInput = typeof UsersModel.login.static
export type UserResponse = typeof UsersModel.response.static