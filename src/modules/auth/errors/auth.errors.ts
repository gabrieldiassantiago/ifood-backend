import { UnauthorizedError, ForbiddenError, ValidationError, ConflictError } from "../../../errors/custom-errors";

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super("Email ou senha incorretos", "INVALID_CREDENTIALS");
  }
}

export class AccountNotActivatedError extends ForbiddenError {
  constructor() {
    super("Conta não ativada. Verifique seu email", "ACCOUNT_NOT_ACTIVATED");
  }
}

export class TokenMissingError extends UnauthorizedError {
  constructor() {
    super("Token de autenticação ausente", "TOKEN_MISSING");
  }
}

export class AccountLockedError extends ForbiddenError {
  constructor() {
    super("Conta temporariamente bloqueada devido a múltiplas tentativas falhas", "ACCOUNT_LOCKED");
  }
}

export class SessionExpiredError extends UnauthorizedError {
  constructor() {
    super("Sessão expirada. Faça login novamente", "SESSION_EXPIRED");
  }
}

export class RefreshTokenInvalidError extends UnauthorizedError {
  constructor() {
    super("Refresh token inválido", "REFRESH_TOKEN_INVALID");
  }
}

export class EmailAlreadyVerifiedError extends ConflictError {
  constructor() {
    super("Email já verificado", "EMAIL_ALREADY_VERIFIED");
  }
}

export class VerificationTokenInvalidError extends ValidationError {
  constructor() {
    super("Token de verificação inválido ou expirado", "VERIFICATION_TOKEN_INVALID");
  }
}

export class PasswordResetTokenInvalidError extends ValidationError {
  constructor() {
    super("Token de redefinição de senha inválido ou expirado", "PASSWORD_RESET_TOKEN_INVALID");
  }
}

export class OAuthProviderError extends UnauthorizedError {
  constructor(provider: string) {
    super(`Erro na autenticação com ${provider}`, "OAUTH_PROVIDER_ERROR");
  }
}
