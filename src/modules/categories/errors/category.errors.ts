import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from "../../../errors/custom-errors";

export class CategoryNotFoundError extends NotFoundError {
  constructor(categoryId?: string) {
    super(categoryId ? `Categoria com ID ${categoryId} não encontrada` : "Categoria não encontrada", "CATEGORY_NOT_FOUND");
  }
}

export class CategoryAlreadyExistsError extends ConflictError {
  constructor(name: string) {
    super(`Categoria com nome '${name}' já existe`, "CATEGORY_ALREADY_EXISTS");
  }
}

export class InvalidCategoryDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_CATEGORY_DATA");
  }
}

export class CategoryInUseError extends ConflictError {
  constructor() {
    super("Não é possível excluir uma categoria que possui produtos associados", "CATEGORY_IN_USE");
  }
}

export class CategoryPermissionDeniedError extends ForbiddenError {
  constructor() {
    super("Apenas administradores podem gerenciar categorias", "CATEGORY_PERMISSION_DENIED");
  }
}
