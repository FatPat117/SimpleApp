import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response";

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Validation failed",
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    );
    return;
  }

  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.code, error.message, error.details);
    return;
  }

  sendError(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "Internal server error",
    env.NODE_ENV === "development" ? { stack: error.stack } : undefined
  );
};
