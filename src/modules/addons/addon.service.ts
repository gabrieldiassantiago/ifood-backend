import { AddonRepository } from "./addon.repository";

export class AddonService {
    
    constructor(
        private addonRepository: AddonRepository = new AddonRepository()
    ) {}

    async getAllAddons() {
        return this.addonRepository.findAll();
    }

    async createAddon(name: string, price: number, productId: string) {
        return this.addonRepository.create(name, price, productId);
    }

    async getAddonsByProductId(productId: string) {
        return this.addonRepository.findByProductId(productId);
    }
    
    
}