import { NotFoundError, ValidationError, ConflictError, UnauthorizedError, ForbiddenError } from "../../../errors/custom-errors";

export class UserNotFoundError extends NotFoundError {
  constructor(userId?: string) {
    super(userId ? `Usuário com ID ${userId} não encontrado` : "Usuário não encontrado", "USER_NOT_FOUND");
  }
}

export class UserEmailNotFoundError extends NotFoundError {
  constructor(email: string) {
    super(`Usuário com email '${email}' não encontrado`, "USER_EMAIL_NOT_FOUND");
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Usuário com email '${email}' já existe`, "USER_ALREADY_EXISTS");
  }
}

export class InvalidUserDataError extends ValidationError {
  constructor(message: string) {
    super(message, "INVALID_USER_DATA");
  }
}

export class InvalidEmailError extends ValidationError {
  constructor() {
    super("Email inválido", "INVALID_EMAIL");
  }
}

export class InvalidPasswordError extends ValidationError {
  constructor() {
    super("Senha deve ter no mínimo 6 caracteres", "INVALID_PASSWORD");
  }
}

export class InvalidPhoneError extends ValidationError {
  constructor() {
    super("Telefone inválido", "INVALID_PHONE");
  }
}

export class UserUnauthorizedError extends UnauthorizedError {
  constructor() {
    super("Credenciais inválidas", "USER_UNAUTHORIZED");
  }
}

export class UserForbiddenError extends ForbiddenError {
  constructor() {
    super("Acesso negado", "USER_FORBIDDEN");
  }
}

export class TokenInvalidError extends UnauthorizedError {
  constructor() {
    super("Token inválido ou expirado", "TOKEN_INVALID");
  }
}

export class TokenMissingError extends UnauthorizedError {
  constructor() {
    super("Token não fornecido", "TOKEN_MISSING");
  }
}
