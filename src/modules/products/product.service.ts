import { ProductRepository } from "./product.repository";
import { CreateProductInput, UpdateProductInput } from "./product.model";
import { ProductNotFoundError, InvalidPriceError } from "./errors/products.errors";
import { storage, BUCKET_ID } from "../../config/appwrite.config";


function extractFileIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const match = url.match(/files\/([^\/]+)\/(view|download|preview)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function deleteAppwriteFile(fileId: string): Promise<void> {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error: any) {
  }
}

export class ProductService {
  constructor(
    private repository: ProductRepository = new ProductRepository()
  ) {}

  // Retorna todos os produtos (admin)
  async getAllProducts() {
    return this.repository.findAll();
  }

  // Retorna apenas produtos de categorias ativas (público/clientes)
  async getActiveProducts() {
    return this.repository.findAllActive();
  }

  async getProductById(id: string) {
    const product = await this.repository.findById(id);
    
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return product;
  }

  async getProductsByCategory(categoryId: string) {
    return this.repository.findByCategory(categoryId);
  }

  async createProduct(data: CreateProductInput) {
    if (data.price <= 0) {
      throw new InvalidPriceError();
    }

    return this.repository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    
    const currentProduct = await this.getProductById(id);

    if (data.price !== undefined && data.price <= 0) {
      throw new InvalidPriceError();
    }

    // Verificar se a imagem foi removida ou alterada
    if (data.imageUrl !== undefined && currentProduct.imageUrl) {
      const oldFileId = extractFileIdFromUrl(currentProduct.imageUrl);
      const newFileId = extractFileIdFromUrl(data.imageUrl);
      
      // Se a imagem foi removida (imageUrl = null ou vazio) ou alterada para outra URL
      if (oldFileId && oldFileId !== newFileId) {
        // Deletar imagem antiga do Appwrite
        await deleteAppwriteFile(oldFileId);
      }
    }

    return this.repository.update(id, data);
  }

  async deleteProduct(id: string) {
    const product = await this.getProductById(id);
    
    // Deletar imagem do Appwrite se existir
    if (product.imageUrl) {
      const fileId = extractFileIdFromUrl(product.imageUrl);
      if (fileId) {
        await deleteAppwriteFile(fileId);
      }
    }
    
    return this.repository.delete(id);
  }

  async toggleAvailability(id: string) {
    const product = await this.getProductById(id);
    return this.repository.update(id, { isAvailable: !product.isAvailable });
  }

  async addAddon(productId: string, data: { name: string; price: number }) {

    await this.getProductById(productId);

    if (data.price <= 0) {
      throw new InvalidPriceError();
    }

    return this.repository.createAddon(productId, data);
  }

  async getProductAddons(productId: string) {
    await this.getProductById(productId);
    return this.repository.findAddonsByProductId(productId);
  }

  async updateAddon(addonId: string, data: { name?: string; price?: number; isActive?: boolean }) {
    if (data.price !== undefined && data.price <= 0) {
      throw new InvalidPriceError();
    }

    return this.repository.updateAddon(addonId, data);
  }

  async deleteAddon(addonId: string) {
    return this.repository.deleteAddon(addonId);
  }
}