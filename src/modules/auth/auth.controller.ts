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

        async ({ jwt, body, set, request, server }) => { 
            try {

                const userAgent = request.headers.get('user-agent') || 'unknown'; //talvez seja irrelevante, mas sei la
                
                const ip = server?.requestIP(request);
                const ipAddress = ip ? 
                    (ip.address === '::1' || ip.address === '127.0.0.1' ? 'localhost' : ip.address) 
                    : 'unknown';

                const deviceInfo = {
                    userAgent,
                    platform: request.headers.get('sec-ch-ua-platform') || 'unknown',
                    mobile: request.headers.get('sec-ch-ua-mobile') === '?1',
                };

                const result = await authService.loginByPhone(
                    body.phone, 
                    body.password, 
                    jwt,
                    ipAddress,
                    deviceInfo
                );

                set.headers['set-cookie'] = [
                    `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000`
                ].join(', ');

                return { 
                    token: result.token,
                    refreshToken: result.refreshToken
                   
                };
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
        async ({ jwt, body, set }) => { //falta refatorar '-'
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