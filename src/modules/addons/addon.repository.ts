import { prisma } from "../../../prisma/db";

export class AddonRepository {
    findAll() {
        return prisma.addon.findMany({
        });
    }
    
    findById(id: string) {
        return prisma.addon.findUnique({
            where: { id },
        });
    }

}