import { Router } from "express";
import {
  createService,
  getMyServices,
  getServiceById,
  updateService,
  deleteService,
} from "./services.controller.js";
import { createServiceValidator, updateServiceValidator } from "./services.validators.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Crear un nuevo servicio (HU-10, RF-12)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category, mode, basePrice]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Instalación eléctrica residencial
 *               description:
 *                 type: string
 *                 example: Instalación completa de red eléctrica para hogares
 *               category:
 *                 type: string
 *                 enum: [TECNOLOGIA, HOGAR, SALUD, EDUCACION, MECANICA, CONSTRUCCION, FONTANERIA, MANUFACTURA]
 *               mode:
 *                 type: string
 *                 enum: [DOMICILIO, LOCAL]
 *               basePrice:
 *                 type: number
 *                 example: 80000
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post(
  "/",
  authenticate,
  authorize("PROVIDER"),
  createServiceValidator,
  validateRequest,
  createService
);

/**
 * @swagger
 * /api/services/my:
 *   get:
 *     summary: Obtener mis servicios como prestador
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios del prestador autenticado
 */
router.get("/my", authenticate, authorize("PROVIDER"), getMyServices);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Ver detalle de un servicio
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle del servicio
 *       404:
 *         description: Servicio no encontrado
 */
router.get("/:serviceId", getServiceById);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   patch:
 *     summary: Actualizar un servicio
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       403:
 *         description: Sin permiso para editar este servicio
 */
router.patch(
  "/:serviceId",
  authenticate,
  authorize("PROVIDER"),
  updateServiceValidator,
  validateRequest,
  updateService
);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   delete:
 *     summary: Eliminar un servicio
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Servicio eliminado
 */
router.delete("/:serviceId", authenticate, authorize("PROVIDER"), deleteService);

export default router;
