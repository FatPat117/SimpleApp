import type { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import { AppError } from "../utils/AppError";

export const requirePasswordChange = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!user.requiresPasswordChange) {
    throw new AppError("Password change is not required", 400);
  }
  next();
};
