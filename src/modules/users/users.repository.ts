import { prisma } from "../../../prisma/db";
import { CreateUserInput } from "./model";

export class UsersRepository {
    
    create(data: CreateUserInput) {
        return prisma.user.create({
            data: {
                ...data,
                role: data.role || "USER"
            }
        })
    }

    findAll() {
        return prisma.user.findMany({
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
}