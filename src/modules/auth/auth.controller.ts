import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";

export const auth = new Elysia({ prefix: "/auth" })
    .use(
        jwt({
            name: "jwt",
            secret: 'secreto',
            exp: "7d" 
        })
    )
    .post(
        "/login",
        async ({ jwt, body, set }) => {
            try {
                const authService = new AuthService();
                
                const user = await authService.loginByPhone(
                    body.phone,
                    body.password
                );

                const token = await jwt.sign({
                    id: user.id,
                    phone: user.phone,
                    role: user.role
                });

                return {
                    token,
                    user
                };
            } catch (error) {
                set.status = 401;
                return {
                    error: error instanceof Error ? error.message : "Authentication failed"
                };
            }
        },
        {
            body: t.Object({
                phone: t.String(),
                password: t.String()
            })
        }
    )
    .post(
        "/admin/login",
        async ({ jwt, body, set }) => {
            try {

                const authService = new AuthService();
                
                const user = await authService.loginAdmin(
                    body.email,
                    body.password
                );

                const token = await jwt.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role
                });

                return {
                    token,
                    user
                };
            } catch (error) {
                set.status = 401;
                return {
                    error: error instanceof Error ? error.message : "Authentication failed"
                };
            }
        },
        {
            body: t.Object({
                email: t.String(),
                password: t.String()
            })
        }
    )
    ;
    
