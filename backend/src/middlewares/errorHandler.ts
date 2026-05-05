import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error"
  });
};
