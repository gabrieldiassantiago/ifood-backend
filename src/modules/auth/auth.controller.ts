import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { LoginByPhoneSchema, LoginAdminSchema, AuthResponseSchema, AuthErrorSchema } from "./auth.schemas";
import { TokenMissingError } from "../users/errors/user.errors";

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
            const userAgent = request.headers.get('user-agent') || 'unknown';
            
            const ip = server?.requestIP(request);
            
            const ipAddress = ip ? 
                (ip.address === '::1' || ip.address === '127.0.0.1' ? 'localhost' : ip.address) 
                : 'unknown';

            const deviceInfo = {
                userAgent,
                platform: request.headers.get('sec-ch-ua-platform') || 'unknown',
                mobile: request.headers.get('sec-ch-ua-mobile') === '?1',
            };

            const result = await authService.login(
                body.phone, 
                body.password, 
                jwt,
                ipAddress,
                deviceInfo
            );

            set.headers['set-cookie'] = [
                `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/auth; Max-Age=2592000`
            ].join(', ');

            return { 
                token: result.token,
                refreshToken: result.refreshToken
               
            };
        },
        {
            body: LoginByPhoneSchema,
            response: { 200: AuthResponseSchema, 401: AuthErrorSchema },
            detail: {
                tags: ["Auth"],
                summary: "Fazer login",
                description: "Autentica o usuário com telefone e senha, retornando token JWT e refresh token.",
            }
        }
    )

    .post("/refresh",
    async ({ jwt, headers }) => {
        const refreshToken = headers['cookie']?.match(/refreshToken=([^;]+)/)?.[1];

        if (!refreshToken) {
            throw new TokenMissingError();
        }

        const result = await authService.refreshAccessToken(refreshToken, jwt);

        return result;
    },
    {
        detail: {
            tags: ["Auth"],
            summary: "Renovar token de acesso",
            description: "Renova o token de acesso JWT usando o refresh token armazenado nos cookies.",
        }
    })