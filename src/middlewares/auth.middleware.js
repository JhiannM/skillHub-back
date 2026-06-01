import { verifyToken } from "../config/jwt.js";
import { errorResponse } from "../utils/response.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(res, "No autorizado. Token no proporcionado", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);

    req.user = payload;

    next();
  } catch {
    return errorResponse(res, "Token invalido o expirado", 401);
  }
}
