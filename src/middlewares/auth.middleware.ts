import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET || "secreto",
      })
    )
    .derive(async ({ jwt, headers, set }) => {
      const authHeader = headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Missing authorization token");
      }

      const token = authHeader.substring(7);
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        throw new Error("Invalid or expired token");
      }

      return { user: payload };
    });

export const adminGuard = (app: Elysia) =>
  app
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }: any) => {
      if (user?.role !== "ADMIN") {
        set.status = 403;
        throw new Error("Admin access required");
      }
    });
