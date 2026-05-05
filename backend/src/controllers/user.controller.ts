/** HTTP /users/me: profile user đang login (không lộ password/hash). */
import type { Request, Response } from "express";
import { userService } from "../services/user.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/response";
import { updateMeSchema } from "../validations/user.validation";

export const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const user = await userService.getById(req.user.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccess(res, 200, {
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
  sendSuccess(res, 200, {
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      requiresPasswordChange: updatedUser.requiresPasswordChange,
      isEmailVerified: updatedUser.isEmailVerified
    }
  });
});
