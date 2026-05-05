/** Express stack: security, CORS, body, Swagger `/api/docs`, routes, 404, error. */
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { openApiSpec } from "./docs/openapi";
import { errorHandler } from "./middlewares/errorHandler";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { apiRouter } from "./routes";
import { sendError } from "./utils/response";

const swaggerUi = require("swagger-ui-express");

export const app = express();

// Proxy trước app (nginx, LB): để Express lấy đúng IP client khi rate limit.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: [env.FRONTEND_URL],
    credentials: true
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger UI inline script CSP xung đột Helmet → tắt CSP riêng cho /api/docs.
const docsHelmet = helmet({ contentSecurityPolicy: false });
app.use(
  "/api/docs",
  docsHelmet,
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec as unknown as Record<string, unknown>, {
    customSiteTitle: "SimpleApp API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      withCredentials: true,
      displayRequestDuration: true
    }
  })
);

app.use("/api", apiRateLimiter);

app.use("/api", apiRouter);
app.use((_req, res) => {
  sendError(res, 404, "NOT_FOUND", "Route not found");
});
app.use(errorHandler);
