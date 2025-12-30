import { prisma } from "../../../prisma/db";

export class AuthRepository {
    findByPhone(phone: string) {
        return prisma.user.findUnique({
            where: { phone }
        })
    }

    findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })
    }
    findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }
}