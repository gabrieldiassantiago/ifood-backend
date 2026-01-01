import { StoreRepository } from "./store.repository";

// Cache simples em memória
let catalogCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

export class StoreService {
   constructor(
     private repository: StoreRepository = new StoreRepository()
   ) {}
   
    async getStoreInfo() {
        const storeInfo = await this.repository.findStoreInfo();
        return storeInfo;
    }

    async updateStoreInfo(data: { name?: string; address?: string; phone?: string; isOpen?: boolean, estimatedDeliveryTime?: number }) {
        await this.repository.updateStoreInfo(data);
        // Invalida o cache ao atualizar
        this.invalidateCatalogCache();
    }

    async getCatalog(forceRefresh = false) {
        const now = Date.now();
        const isCacheValid = catalogCache && (now - cacheTimestamp) < CACHE_TTL;

        if (!forceRefresh && isCacheValid) {
            return {
                ...catalogCache,
                cached: true,
                cacheAge: Math.floor((now - cacheTimestamp) / 1000), // segundos
            };
        }

        const catalog = await this.repository.getCatalog();
        
        // Atualiza cache
        catalogCache = catalog;
        cacheTimestamp = now;

        return {
            ...catalog,
            cached: false,
        };
    }

    invalidateCatalogCache() {
        catalogCache = null;
        cacheTimestamp = 0;
    }
}