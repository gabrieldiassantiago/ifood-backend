import { Elysia, status } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMacro = new Elysia({ name: "authMacro" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "secreto",
    })
  )
  .macro({
    isAdmin: {
      resolve: async ({ jwt, headers }) => {
        const authHeader = headers.authorization;

        if (!authHeader?.startsWith("Bearer "))
          return status(401, "Missing authorization token");

        const token = authHeader.substring(7);
        const payload = await jwt.verify(token);

        if (!payload) return status(401, "Invalid or expired token");
        
        if ((payload as any).role !== "ADMIN")
          return status(403, "Admin access required");

        return { user: payload };
      },
    },
  });
