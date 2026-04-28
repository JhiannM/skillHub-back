import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";



const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SkillHub API",
      version: "1.0.0",
      description: "Documentacion de la API de Skillhub",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerDocs = [
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec),
];

export { swaggerSpec, swaggerUi, swaggerDocs };

