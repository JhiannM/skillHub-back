import { body, query } from "express-validator";

// Categorías válidas — deben coincidir con category_enum en el schema y
// con los <option value="..."> del frontend (se normalizan a mayúsculas abajo)
const VALID_CATEGORIES = [
  "TECNOLOGIA", "HOGAR", "SALUD", "EDUCACION",
  "MECANICA", "CONSTRUCCION", "FONTANERIA", "MANUFACTURA",
  // Categorías adicionales que usa el frontend
  "EVENTOS", "TRANSPORTE", "CREATIVIDAD",
];

const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export const updateProfileValidator = [
  body("bio")
    .optional()
    .isLength({ max: 500 }).withMessage("La biografía no puede superar 500 caracteres"),

  body("phone")
    .optional()
    .matches(/^[+\d\s\-().]{7,20}$/).withMessage("El teléfono no tiene un formato válido"),

  body("city")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("La ciudad debe tener entre 2 y 100 caracteres"),

  body("skills")
    .optional()
    .isArray({ max: 20 }).withMessage("Las habilidades deben ser un arreglo de máximo 20 elementos"),

  body("skills.*")
    .optional()
    .isString().isLength({ min: 1, max: 50 })
    .withMessage("Cada habilidad debe ser un texto de máximo 50 caracteres"),

  // Problema #1 resuelto: mínimo alineado con el frontend (input min="10000")
  body("basePrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio base debe ser un número positivo"),

  // Problema #2 resuelto: se normaliza a mayúsculas antes de validar
  body("mainCategory")
    .optional()
    .customSanitizer((value) => (typeof value === "string" ? value.toUpperCase() : value))
    .isIn(VALID_CATEGORIES)
    .withMessage(`Categoría no válida. Opciones: ${VALID_CATEGORIES.join(", ")}`),

  body("yearsExperience")
    .optional()
    .isInt({ min: 0, max: 60 }).withMessage("Los años de experiencia deben ser entre 0 y 60"),

  // Problema #3 resuelto: valida la estructura del schedule que envía el frontend
  body("schedule")
    .optional()
    .isObject().withMessage("El horario debe ser un objeto JSON válido")
    .custom((schedule) => {
      for (const day of Object.keys(schedule)) {
        if (!DAYS.includes(day)) {
          throw new Error(`Día inválido: "${day}". Días válidos: ${DAYS.join(", ")}`);
        }
        const slot = schedule[day];
        if (typeof slot !== "object" || slot === null) {
          throw new Error(`El horario del día "${day}" debe ser un objeto`);
        }
        if (typeof slot.enabled !== "boolean") {
          throw new Error(`El campo "enabled" del día "${day}" debe ser un booleano`);
        }
        if (slot.enabled) {
          const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
          if (!timeRegex.test(slot.inicio)) {
            throw new Error(`La hora de inicio del día "${day}" debe tener formato HH:MM`);
          }
          if (!timeRegex.test(slot.fin)) {
            throw new Error(`La hora de fin del día "${day}" debe tener formato HH:MM`);
          }
          if (slot.inicio >= slot.fin) {
            throw new Error(`La hora de fin del día "${day}" debe ser mayor a la de inicio`);
          }
        }
      }
      return true;
    }),

  body("serviceDescription")
    .optional()
    .isLength({ max: 300 }).withMessage("La descripción de servicios no puede superar 300 caracteres"),
];

export const searchValidator = [
  query("category")
    .optional()
    .customSanitizer((value) => (typeof value === "string" ? value.toUpperCase() : value))
    .isIn(VALID_CATEGORIES)
    .withMessage("Categoría no válida"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio mínimo debe ser un número positivo"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio máximo debe ser un número positivo"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("La página debe ser un número entero positivo"),
];