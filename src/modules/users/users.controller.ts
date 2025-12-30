import { Elysia, t } from "elysia"
import { CreateUserInput, UsersModel } from "./model"
import { UsersService } from "./users.service"

const service = new UsersService()

export const users = new Elysia({ prefix: "/users" })
  .get(
    "/",
    // @ts-expect-error - Elysia middleware type inference issue
    async ({ user }) => {
      console.log("User autenticado:", user)
      return service.getAllUsers()
    },
    {
      response: {
        200: t.Array(UsersModel.response),
      },
      detail: {
        tags: ["Users"],
        summary: "Listar todos os usuários",
        description: "Retorna uma lista de todos os usuários cadastrados",
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
      response: {
        200: UsersModel.response,
      },
      detail: {
        tags: ["Users"],
        summary: "Criar um novo usuário",
        description: "Cadastra um novo usuário no sistema",
      }
    }
  )


  .get(
    "/:id",
    // @ts-expect-error - Elysia middleware type inference issue
    async ({ params: { id }, user, set }) => {
      console.log("User autenticado:", user)
      const foundUser = await service.getUserById(id)

      if (!foundUser) {
        set.status = 404
        return { message: "User not found" }
      }

      return foundUser
    },
    {
      response: {
        200: UsersModel.response,
        404: UsersModel.errorResponse,
      },
      detail: {
        tags: ["Users"],
        summary: "Buscar usuário por ID",
        description: "Retorna os dados de um usuário específico",
      },
    }
  )

