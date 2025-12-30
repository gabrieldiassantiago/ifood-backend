import { Elysia } from "elysia";
import { users } from "./modules/users/users.controller";
import { auth } from "./modules/auth/auth.controller";
import { products } from "./modules/products/product.controller";
import { prisma } from "../prisma/db";

const app = new Elysia()
  .get("/", () => ({
    message: "iFood API",
    version: "1.0.0",
  }))
  .use(users)
  .use(auth)
  .use(products)
  .listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
