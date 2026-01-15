// auth.controller.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { LoginByPhoneSchema, LoginAdminSchema, AuthResponseSchema, AuthErrorSchema } from "./auth.schemas";

const authService = new AuthService(); 

export const auth = new Elysia({ prefix: "/auth" })
    .use(
        jwt({
            name: "jwt",
            secret: process.env.JWT_SECRET || 'secreto', 
            exp: "7d" 
        })
    )

    .post(
        "/login",
        async ({ jwt, body, set }) => { 
            try {
                return await authService.loginByPhone(body.phone, body.password, jwt);
            } catch (e: any) {
                set.status = 401;
                return { error: e.message };
            }
        },
        {
            body: LoginByPhoneSchema,
            response: { 200: AuthResponseSchema, 401: AuthErrorSchema }
        }
    )
    .post(
        "/admin/login",
        async ({ jwt, body, set }) => {
            try {
                return await authService.loginAdmin(body.email, body.password, jwt);
            } catch (e: any) {
                set.status = 401;
                return { error: e.message };
            }
        },
        {
            body: LoginAdminSchema,
            response: { 200: AuthResponseSchema, 401: AuthErrorSchema }
        }
    );