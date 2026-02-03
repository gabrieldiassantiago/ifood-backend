import { Elysia, status } from "elysia";
import { jwt } from "@elysiajs/jwt";

function getCookie(headers: Headers, name: string) {
  const cookie = headers.get("cookie");
  if (!cookie) return null;

  const part = cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(name + "="));

  return part ? decodeURIComponent(part.split("=").slice(1).join("=")) : null;
}

export const authMacro = new Elysia({ name: "authMacro" })
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "secreto",
    })
  )
  .macro({
    isAuth: {
      resolve: async ({ jwt, headers, set }) => {

        const authHeader = headers["authorization"] || headers["Authorization"];

        let token =
          typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

        // 2) tenta cookie token=
        if (!token) token = getCookie(headers as any, "token");

        if (!token) return status(401, "Missing token");

        const payload = await jwt.verify(token);
        if (!payload) return status(401, "Invalid or expired token");

        return { user: payload };
      },
    },

    isAdmin: {
      isAuth: true,
      resolve: ({ user }: any) => {
        if ((user as any)?.role !== "ADMIN")
          return status(403, "Admin access required");
      },
    },
  });
