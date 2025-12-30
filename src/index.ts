import { Elysia } from "elysia";
import { users } from "./modules/users/users.controller";

const app = new Elysia()
  .get("/", () => ({
    message: "iFood API",
    version: "1.0.0",
  }))
  .use(users)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
