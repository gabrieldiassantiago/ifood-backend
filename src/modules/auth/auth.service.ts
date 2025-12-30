import jwt from "@elysiajs/jwt";
import { AuthRepository } from "./auth.repository";

export class AuthService {
    constructor(
        private authRepository: AuthRepository = new AuthRepository()
    ) {}

   async loginByPhone(phone: string, password: string) {
    const user = await this.authRepository.findByPhone(phone);

    if (!user) {
        throw new Error("Telefone ou senha inválidos");
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Telefone ou senha inválidos");
    }

    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
    };
}

async loginAdmin(email: string, password: string) {

    const user = await this.authRepository.findByEmail(email);

    const isValidUser = await this.authRepository.findByEmail(email);
    
    if (!isValidUser || isValidUser.role !== "ADMIN") {
        throw new Error("Email ou senha inválidos"); //padronizar erros
    }

    if (!user) {
        throw new Error("Email ou senha inválidos");
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Email ou senha inválidos");
    }
    
    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
    };

}

}