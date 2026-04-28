import { body } from "express-validator";


//Validador para el registro de usuarios


export const registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato valido")
    .trim()
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contrasena es obligatoria")
    .isLength({ min: 8 })
    .withMessage("La contrasena debe tener minimo 8 caracteres")
    .matches(/[A-Z]/)
    .withMessage("La contrasena debe contener al menos una mayuscula")
    .matches(/[a-z]/)
    .withMessage("La contrasena debe contener al menos una minuscula")
    .matches(/[0-9]/)
    .withMessage("La contrasena debe contener al menos un numero"),

  body("role")
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(["PROVIDER", "CUSTOMER"])
    .withMessage("El rol debe ser PROVIDER o CUSTOMER"),
];

export const loginValidator = [

  body("email")
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato valido"),

  body("password")
    .notEmpty()
    .withMessage("La contrasena es obligatoria")
    .trim()
    .normalizeEmail(),
    
]
