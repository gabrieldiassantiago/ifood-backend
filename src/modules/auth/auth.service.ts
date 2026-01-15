import { uuid, uuidv4 } from "zod";
import { AuthRepository } from "./auth.repository";

export class AuthService {
    constructor(
        private authRepository: AuthRepository = new AuthRepository()
    ) {}

    async loginByPhone(phone: string, pass: string, jwt: any, ipAddress: string, deviceInfo: any) {

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

    async loginAdmin(email: string, pass: string, jwt: any) {
        const user = await this.authRepository.findByEmail(email);

        if (!user || user.role !== "ADMIN" || !(await Bun.password.verify(pass, user.password))) {
            throw new Error("Email ou senha inválidos");
        }

        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return { token, user };
    }
}