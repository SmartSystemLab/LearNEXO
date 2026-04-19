import express, { Application, Request, Response } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { config } from "dotenv";
import swaggerUi from "swagger-ui-express";

import Logging from "./middleware/logging";
import { errorResponse, notFound } from "./middleware/errorHandler";
import { ResponseInterface } from "./global/interface/response.interface";

import mongooseConnection from "./connections/database.connection";

import authRoute from "./auth/auth.routes";
import questionnaireRoute from "./questionnaire/questionnaire.routes";

import { swaggerSpec } from "./docs/swagger";

config();

const app: Application = express();
const httpServer = http.createServer(app);

/**
 * Middleware
 */
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static(path.join(__dirname, "../public")));

/**
 * Swagger JSON (important for manual JSDoc approach)
 */
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * Swagger UI (primary docs UI)
 */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  }),
);

/**
 * Optional direct spec UI (useful for debugging)
 */
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Health check
 */
app.get("/", (req: Request, res: Response<ResponseInterface>) => {
  res.status(200).json({
    message: "🚀 LearNexo server is up and running",
    status: true,
  });
});

/**
 * Routes
 */
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/questionnaire", questionnaireRoute);

/**
 * Error handling (must be last)
 */
app.use(notFound);
app.use(errorResponse);

/**
 * Server bootstrap
 */
const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await mongooseConnection();
  } catch (error) {
    Logging.error("Unable to connect to the database: " + error);
  }

  httpServer.listen(PORT, () => {
    Logging.info(`🚀 App is running on port ${PORT}`);
    Logging.info(`📄 Swagger UI: http://localhost:${PORT}/api-docs`);
  });
})();
