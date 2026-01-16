import { uuid, uuidv4 } from "zod";
import { AuthRepository } from "./auth.repository";

export class AuthService {
    constructor(
        private authRepository: AuthRepository = new AuthRepository()
    ) {}

    async login(phone: string, pass: string, jwt: any, ipAddress: string, deviceInfo: any) {

        const user = await this.authRepository.findByPhone(phone);

        if (!user || !(await Bun.password.verify(pass, user.password))) {
            throw new Error("Telefone ou senha inválidos");
        }

        const token = await jwt.sign({
            id: user.id,
            phone: user.phone,
            role: user.role
        });

        const refreshToken = crypto.randomUUID();

        const expiresAt = new Date();

        expiresAt.setDate(expiresAt.getDate() + 30); 

       await this.authRepository.createRefreshToken(
            user.id, 
            refreshToken, 
            expiresAt,
            JSON.stringify(deviceInfo),  
            ipAddress
        );

        return { token, refreshToken };
    }

    async refreshAccessToken(refreshToken: string, jwt: any) {
        const tokenData = await this.authRepository.findRefreshToken(refreshToken);

        if (!tokenData || tokenData.expiresAt < new Date()) {
            throw new Error("Refresh token inválido ou expirado");
        }

        const user = await this.authRepository.findById(tokenData.userId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const newToken = await jwt.sign({
            id: user.id,
            phone: user.phone,
            role: user.role
        });

        return { token: newToken };

    }

}