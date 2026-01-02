import { Elysia, t } from "elysia";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { AddressService } from "./address.service";

const service = new AddressService();

export const addresses = new Elysia({ prefix: "/addresses" })
  .use(authMiddleware)
  
  // Criar endereço
  .post(
    "/",
    async ({ body, user }: any) => {
      try {
        const address = await service.createAddress({
          street: body.street,
          number: body.number,
          district: body.district,
          city: body.city,
          reference: body.reference,
          userId: user.id,
        });

        return {
          success: true,
          data: address,
        };
      } catch (error) {
        throw error;
      }
    },
    {
      body: t.Object({
        street: t.String(),
        number: t.String(),
        district: t.String(),
        city: t.String(),
        reference: t.Optional(t.String()),
      }),
      detail: {
        tags: ["Addresses"],
        summary: "Criar novo endereço",
        description: "Cadastra um novo endereço de entrega para o usuário autenticado.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Listar endereços do usuário
  .get(
    "/",
    async ({ user }: any) => {
      const addresses = await service.getUserAddresses(user.id);

      return {
        success: true,
        data: addresses,
      };
    },
    {
      detail: {
        tags: ["Addresses"],
        summary: "Listar meus endereços",
        description: "Retorna todos os endereços cadastrados pelo usuário autenticado.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Deletar endereço
  .delete(
    "/:id",
    async ({ params, user }: any) => {
      const result = await service.deleteAddress(params.id, user.id);

      return {
        success: true,
        message: result.message,
      };
    },
    {
      detail: {
        tags: ["Addresses"],
        summary: "Deletar endereço",
        description: "Remove um endereço cadastrado. Apenas o dono do endereço pode deletá-lo.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
