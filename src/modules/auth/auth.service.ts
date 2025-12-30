import jwt from "@elysiajs/jwt";
import { AuthRepository } from "./auth.repository";

export class AuthService {
    constructor(
        private authRepository: AuthRepository = new AuthRepository()
    ) {}

   async loginByPhone(phone: string, password: string) {
    const user = await this.authRepository.findByPhone(phone);

    if (!user) {
        throw new Error("Invalid phone number or password");
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
        throw new Error("Invalid phone number or password");
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