import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string
): Response => {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): Response => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
};
