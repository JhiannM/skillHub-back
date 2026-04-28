import { errorResponse } from "../helpers/response.helper.js";

// Middleware para verificar el rol del usuario
export function roleMiddleware(role) {
  return (req, res, next) => {

    const userRole = req.user?.role;
    if (!userRole) {
      return errorResponse(res, "Rol de usuario no encontrado", 401);
    }

    if (!role.includes(userRole)) {
      return errorResponse(res, "No tienes permisos para acceder a este recurso", 403);
    }

    next();
  };
}
