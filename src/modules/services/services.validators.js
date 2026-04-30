import { body } from "express-validator";

const VALID_CATEGORIES = [
  "TECNOLOGIA", "HOGAR", "SALUD", "EDUCACION",
  "MECANICA", "CONSTRUCCION", "FONTANERIA", "MANUFACTURA",
];

export const createServiceValidator = [
  body("name")
    .notEmpty().withMessage("El nombre del servicio es obligatorio")
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  body("description")
    .notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ max: 500 }).withMessage("La descripción no puede superar 500 caracteres"),

  body("category")
    .notEmpty().withMessage("La categoría es obligatoria")
    .isIn(VALID_CATEGORIES).withMessage("Categoría no válida"),

  body("mode")
    .notEmpty().withMessage("La modalidad es obligatoria")
    .isIn(["DOMICILIO", "LOCAL"]).withMessage("La modalidad debe ser DOMICILIO o LOCAL"),

  body("basePrice")
    .notEmpty().withMessage("El precio base es obligatorio")
    .isFloat({ min: 0 }).withMessage("El precio base debe ser un número positivo"),
];

export const updateServiceValidator = [
  body("name")
    .optional()
    .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres"),

  body("description")
    .optional()
    .isLength({ max: 500 }).withMessage("La descripción no puede superar 500 caracteres"),

  body("category")
    .optional()
    .isIn(VALID_CATEGORIES).withMessage("Categoría no válida"),

  body("mode")
    .optional()
    .isIn(["DOMICILIO", "LOCAL"]).withMessage("La modalidad debe ser DOMICILIO o LOCAL"),

  body("basePrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio base debe ser un número positivo"),
];
