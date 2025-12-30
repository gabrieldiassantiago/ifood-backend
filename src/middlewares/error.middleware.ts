import { Elysia } from "elysia";
import { AppError } from "../errors/custom-errors";

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        error: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      };
    }

    // Tratamento para erros de validação do Elysia
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "ValidationError",
        message: "Invalid request data",
        details: error.message,
        statusCode: 400,
      };
    }

    // Tratamento para erros de parse
    if (code === "PARSE") {
      set.status = 400;
      return {
        error: "ParseError",
        message: "Invalid JSON format",
        statusCode: 400,
      };
    }

    // Tratamento para Not Found
    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "NotFound",
        message: "Route not found",
        statusCode: 404,
      };
    }

    console.error("Unhandled error:", error);

    set.status = 500;
    return {
      error: "InternalServerError",
      message: "An unexpected error occurred",
      statusCode: 500,
    };
  });