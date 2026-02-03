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

    create(name: string, price: number, productId: string) {
        return prisma.addon.create({
           data: {
               name,
               price,
               product: { connect: { id: productId } },
           },
        });
    }


}