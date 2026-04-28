import * as authService from "./auth.service.js";
import { successResponse } from "../../utils/response.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const { token, user } = await authService.register(
    
      name,
      email,
      password,
      role
    );

    return successResponse(
      res,
      "Usuario registrado exitosamente",
      { token, user },
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { token, user } = await authService.login(email, password);

    return successResponse(
      res,
      "Inicio de sesión exitoso",
      { token, user },
      200
    );
  } catch (error) {
    next(error);
  }
}
