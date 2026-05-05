import type { Request, Response } from "express";
import { userService } from "../services/user.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { updateMeSchema } from "../validations/user.validation";

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await userService.getById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      requiresPasswordChange: user.requiresPasswordChange,
      isEmailVerified: user.isEmailVerified
    }
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const payload = updateMeSchema.parse(req.body);
  const updatedUser = await userService.updateMe(req.user.id, payload);
  res.status(200).json({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      requiresPasswordChange: updatedUser.requiresPasswordChange,
      isEmailVerified: updatedUser.isEmailVerified
    }
  });
});
