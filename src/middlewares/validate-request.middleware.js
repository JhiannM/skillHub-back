import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

/**
 * Middleware para validar los errores de express-validator
 * Debe usarse después de los validadores en las rutas
 */
export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return errorResponse(res, "Errores de validación", 400, formattedErrors);
  }

  next();
}
