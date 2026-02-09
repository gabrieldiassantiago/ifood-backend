import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cache } from "@nowarajs/elysia-cache";
import { AddonService } from "./addon.service";
import {
  CreateAddonSchema,
  AddonResponseSchema,
  AddonsListResponseSchema,
  AddonErrorSchema,
} from "./addon.schemas";
import { AddonPermissionDeniedError } from "./errors/addon.errors";

const addonService = new AddonService();

export const addon = new Elysia({ prefix: "/addons" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "secreto",
      exp: "7d",
    })
  )

  .use(cache())

  .get(
    "/:productId", 
    async ({ params }) => {
      const addons = await addonService.getAddonsByProductId(params.productId);
      return addons;
    },
    {
      response: { 200: AddonsListResponseSchema },
    }
  )


  .post(
    "/",
    async ({ jwt, headers, body }) => {
      
      const authHeader = headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AddonPermissionDeniedError();
      }

      const token = authHeader.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        throw new AddonPermissionDeniedError();
      }

      if (payload.role !== "ADMIN") {
        throw new AddonPermissionDeniedError();
      }

      const addon = await addonService.createAddon(
        body.name,
        body.price,
        body.productId
      );

      return addon;
    },
    {
      body: CreateAddonSchema,
      response: {
        200: AddonResponseSchema,
        400: AddonErrorSchema,
        401: AddonErrorSchema,
        403: AddonErrorSchema,
      },
    }
  );

  
