import { ProductRepository } from "./product.repository";
import { CreateProductInput, UpdateProductInput } from "./product.model";
import { ProductNotFoundError, InvalidPriceError } from "./errors/products.errors";

//future: refatorar para evitar regra de negocio fora do contexto de product

export class ProductService {
  constructor(
    private repository: ProductRepository = new ProductRepository()
  ) {}

  async getAllProducts() {
    return this.repository.findAll();
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
    
    await this.getProductById(id);

    if (data.price !== undefined && data.price <= 0) {
      throw new InvalidPriceError();
    }

    return this.repository.update(id, data);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
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