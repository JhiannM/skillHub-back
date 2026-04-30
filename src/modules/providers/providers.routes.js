import { Router } from "express";
import {
  getMyProfile,
  updateProfile,
  searchProviders,
  getPublicProfile,
} from "./providers.controller.js";
import { updateProfileValidator, searchValidator } from "./providers.validators.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/providers/search:
 *   get:
 *     summary: Buscar prestadores con filtros (RF-04, RF-07)
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Categoría del servicio
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Ciudad del prestador
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: Palabra clave para buscar en nombre, bio o descripción
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Lista de prestadores ordenados por relevancia
 */
router.get("/search", searchValidator, validateRequest, searchProviders);

// ─── Rutas estáticas PRIMERO (antes de /:providerId) ─────────────────────────

/**
 * @swagger
 * /api/providers/me/profile:
 *   get:
 *     summary: Obtener mi perfil de prestador
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del prestador con porcentaje de completitud
 */
router.get("/me/profile", authenticate, authorize("PROVIDER"), getMyProfile);

/**
 * @swagger
 * /api/providers/me/profile:
 *   patch:
 *     summary: Actualizar mi perfil de prestador (HU-02, HU-03)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items: { type: string }
 *               basePrice:
 *                 type: number
 *               mainCategory:
 *                 type: string
 *               serviceDescription:
 *                 type: string
 *               yearsExperience:
 *                 type: integer
 *               schedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.patch(
  "/me/profile",
  authenticate,
  authorize("PROVIDER"),
  updateProfileValidator,
  validateRequest,
  updateProfile
);

// ─── Ruta dinámica DESPUÉS de las estáticas ───────────────────────────────────

/**
 * @swagger
 * /api/providers/{providerId}:
 *   get:
 *     summary: Ver perfil público de un prestador
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Perfil público del prestador
 *       404:
 *         description: Prestador no encontrado
 */
router.get("/:providerId", getPublicProfile);

export default router;