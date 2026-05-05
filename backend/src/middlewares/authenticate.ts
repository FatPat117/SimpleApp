/** Đọc access JWT từ cookie → `req.user` hoặc 401. */
import type { NextFunction, Request, Response } from "express";
import { tokenService } from "../services/token.service";
import { AppError } from "../utils/AppError";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const accessToken = req.cookies?.[tokenService.accessCookieName] as string | undefined;
  if (!accessToken) {
    throw new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }

  const payload = tokenService.verifyAccessToken(accessToken);
  req.user = {
    id: payload.sub,
    email: payload.email,
    username: payload.username
  };
  next();
};
