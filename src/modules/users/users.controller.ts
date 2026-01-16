import { Elysia, t } from "elysia"
import { CreateUserInput, CreateUserSchema, UserResponseSchema, ErrorResponseSchema } from "./model"
import { UsersService } from "./users.service"
import { adminGuard } from "../../middlewares/auth.middleware"
import z from "zod"

const service = new UsersService()

export const users = new Elysia({ prefix: "/users" })

  .get(
    "/",
    async () => {
      return service.getAllUsers()
    },
    {
      response: {
       200: z.array(UserResponseSchema),
      },
      detail: {
        tags: ["Users"],
        summary: "Listar todos os usuários",
        description: "Retorna uma lista de todos os usuários cadastrados no sistema. Requer autenticação como ADMIN.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/",
    async ({body}) => {
      const newUser = await service.createUser(body as CreateUserInput)
      return newUser
    },
    {
      body: CreateUserSchema,
      response: {
        200: UserResponseSchema,
        400: ErrorResponseSchema,
      },
      detail: {
        tags: ["Users"],
        summary: "Criar um novo usuário",
        description: "Cadastra um novo usuário no sistema. Requer autenticação como ADMIN.",
        security: [{ bearerAuth: [] }],
      }
    }
  )


  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const foundUser = await service.getUserById(id)

      if (!foundUser) {
        set.status = 404
        return { message: "User not found" }
      }

      return foundUser
    },
    {
      params: t.Object({
        id: t.String({ description: "ID único do usuário" }),
      }),
      response: {
        200: UserResponseSchema,
        404: ErrorResponseSchema,
      },
      detail: {
        tags: ["Users"],
        summary: "Buscar usuário por ID",
        description: "Retorna os dados de um usuário específico pelo ID. Requer autenticação como ADMIN.",
        security: [{ bearerAuth: [] }],
      },
    }
  ) 

