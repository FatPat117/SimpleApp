import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { tokenService } from "../services/token.service";
import { catchAsync } from "../utils/catchAsync";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  signUpSchema,
  verifyEmailSchema
} from "../validations/auth.validation";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const payload = signUpSchema.parse(req.body);
  await authService.signup(payload);
  res.status(201).json({
    message: "Please check your email to verify your account before logging in."
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.query);
  await authService.verifyEmail(token);
  res.status(200).json({ message: "Email verified successfully" });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);
  tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json({
    expiresIn: result.expiresIn,
    user: result.user
  });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[tokenService.refreshCookieName] as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  const result = await authService.refresh(refreshToken);
  tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json({
    expiresIn: result.expiresIn,
    user: result.user
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }
  tokenService.clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  res.status(200).json({ message: "A temporary password has been sent to your email." });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword } = changePasswordSchema.parse(req.body);
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  await authService.changePassword(req.user.id, newPassword);
  tokenService.clearAuthCookies(res);
  res.status(200).json({ message: "Password changed successfully. Please sign in again." });
});

export const googleAuth = catchAsync(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Google OAuth is not implemented yet" });
});

export const googleCallback = catchAsync(async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Google OAuth callback is not implemented yet" });
});
