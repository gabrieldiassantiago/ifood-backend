import { CategoryRepository } from "./category.repository";

export class CategoryService {
  private repository = new CategoryRepository();

  async getAllCategories() {
    return this.repository.findAll();
  }

  async getCategoryById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }
    return category;
  }

  async createCategory(data: { name: string; order?: number }) {
    const order = data.order ?? await this.repository.getNextOrder();
    return this.repository.create({
      name: data.name,
      order,
      isActive: true
    });
  }

  async updateCategory(id: string, data: { name?: string; order?: number; isActive?: boolean }) {
    return this.repository.update(id, data);
  }

  async deleteCategory(id: string) {
    return this.repository.delete(id);
  }

  async toggleCategoryActive(id: string) {
    return this.repository.toggleActive(id);
  }
}
