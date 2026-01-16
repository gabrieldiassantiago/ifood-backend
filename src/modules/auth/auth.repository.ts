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

      createRefreshToken(
        userId: string, 
        tokenHash: string, 
        expiresAt: Date, 
        deviceInfo?: string, 
        ipAddress?: string
    ) {
        return prisma.refreshToken.create({
            data: {
                userId,
                token: tokenHash,  
                expiresAt,
                deviceInfo,
                ipAddress,
            },
        });
    }

    findRefreshToken(token: string) {
        return prisma.refreshToken.findUnique({
            where: { token },
        });
    }

    
}