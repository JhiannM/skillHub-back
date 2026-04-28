import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

export function errorMiddleware(err, req, res, next) {
  console.error(err);

const isDevelopment = process.env.NODE_ENV === "development";

  // Errores de express-validator
  if (err.array && typeof err.array === "function") {
    return errorResponse(res, "Error de validacion", 400, err.array())
  }

  // Errores de JWT
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Token invalido", 401);
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token expirado", 401);
  }

  // Otros errores
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Error interno del servidor"
        : err.message || "Error en la solicitud",
    data: isDevelopment
      ? {
          stack: err.stack,
        }
      : null,
  });
}
