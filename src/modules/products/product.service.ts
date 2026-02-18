import { ProductRepository } from "./product.repository";
import { CreateProductInput, UpdateProductInput } from "./product.model";
import { ProductNotFoundError, InvalidPriceError } from "./errors/products.errors";
import { UploadService } from "../upload/upload.service";


function extractFileIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const match = url.match(/files\/([^\/]+)\/(view|download|preview)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}



export class ProductService {
  constructor(
    private repository: ProductRepository = new ProductRepository(),
    private uploadService: UploadService = new UploadService()
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

    async createProduct(data: CreateProductInput, file?: File) {
    if (data.price <= 0) {
      throw new InvalidPriceError();
    }

    const categoryExists = await this.repository.findExistCategory(data.categoryId);
    if (!categoryExists) {
      throw new Error(`Categoria com ID ${data.categoryId} não existe.`);
    }

    try {
      const { file: _, ...productData } = data as any;
      
      if (!file) {
        return await this.repository.create(productData);
      }

      const [createdProduct, imageUrl] = await Promise.all([
        this.repository.create(productData),
        this.uploadService.uploadFile(file, crypto.randomUUID()) 
      ]);

      const finalImageUrl = imageUrl.replace(crypto.randomUUID(), createdProduct.id);
      
      return await this.repository.update(createdProduct.id, { 
        imageUrl: finalImageUrl 
      });
      
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw error;
    }
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    
    const currentProduct = await this.getProductById(id);

    if (data.price !== undefined && data.price <= 0) {
      throw new InvalidPriceError();
    }
    if (data.categoryId) {

      const categoryExists = await this.repository.findExistCategory(data.categoryId);
      if (!categoryExists) {
        throw new Error(`Categoria com ID ${data.categoryId} não existe.`);
      }
      
    }

    return this.repository.update(id, data);
  }

  async deleteProduct(id: string) {

    const product = await this.getProductById(id);
    
    if (product.imageUrl) {
      const fileId = extractFileIdFromUrl(product.imageUrl);
      
    }
    
    return this.repository.delete(id);
  }

  async toggleAvailability(id: string) {
    const product = await this.getProductById(id);
    return this.repository.update(id, { isAvailable: !product.isAvailable });
  }

  async getAllAddons() {
    return this.repository.getAllAddons();
  }

  async addAddon(productId: string, data: { name: string; price: number }) {

    await this.getProductById(productId);

    if (data.price <= 0) {
      throw new InvalidPriceError();
    }

    return this.repository.createAddon(productId, data);
  }

  async getProductAddons(productId: string) {
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