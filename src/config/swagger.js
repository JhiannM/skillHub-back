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
        url: "/",
        description: "Servidor actual (Autodetectado)",
      },
      {
        url: "http://localhost:3001",
        description: "Servidor local (Docker)",
      },
      {
        url: "http://localhost:3000",
        description: "Servidor local (Sin Docker)",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description:
            "Ingresa tu token con el prefijo Bearer. Ejemplo: Bearer eyJhbGci...",
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

const swaggerDocs = [swaggerUi.serve, swaggerUi.setup(swaggerSpec)];

export { swaggerSpec, swaggerUi, swaggerDocs };
