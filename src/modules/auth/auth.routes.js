import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { registerValidator, loginValidator } from "./auth.validators.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Carlos Ramirez
 *               email:
 *                 type: string
 *                 example: carlos@ejemplo.com
 *               password:
 *                 type: string
 *                 example: MiClave123
 *               role:
 *                 type: string
 *                 enum: [PROVIDER, CUSTOMER]
 *                 example: PROVIDER
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos invalidos
 *       409:
 *         description: El correo ya esta registrado
 */
router.post(
  "/register",
  registerValidator,
  validateRequest,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesion
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: carlos@ejemplo.com
 *               password:
 *                 type: string
 *                 example: MiClave123
 *     responses:
 *       200:
 *         description: Inicio de sesion exitoso
 *       400:
 *         description: Datos invalidos
 *       401:
 *         description: Credenciales invalidas
 */
router.post(
  "/login",
  loginValidator,
  validateRequest,
  login
);

export default router;
