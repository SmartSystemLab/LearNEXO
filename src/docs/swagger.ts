import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LearNexo API",
      version: "1.0.0",
      description: "API documentation for LearNexo backend",
    },
    servers: [
      {
        url: "http://localhost:5175/api/v1",
      },
    ],
  },

  apis: ["./src/**/*.ts"],
});
