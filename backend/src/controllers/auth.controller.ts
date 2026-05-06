import type { Request, Response } from "express";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import { tokenService } from "../services/token.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/response";
import {
  checkSignUpAvailabilitySchema,
  changePasswordSchema,
  forgotPasswordSchema,
  googleCallbackSchema,
  loginSchema,
  signUpSchema,
  verifyEmailSchema
} from "../validations/auth.validation";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const payload = signUpSchema.parse(req.body);
  const result = await authService.signup(payload);
  sendSuccess(res, 201, result, "Account created. Please verify your account before logging in.");
});

export const checkSignUpAvailability = catchAsync(async (req: Request, res: Response) => {
  const payload = checkSignUpAvailabilitySchema.parse(req.query);
  const result = await authService.checkSignUpAvailability(payload);
  sendSuccess(res, 200, result);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.query);
  await authService.verifyEmail(token);
  sendSuccess(res, 200, null, "Account verified successfully.");
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);
  tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, 200, { expiresIn: result.expiresIn, user: result.user });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[tokenService.refreshCookieName] as string | undefined;
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401, "REFRESH_TOKEN_MISSING");
  }

  const result = await authService.refresh(refreshToken);
  tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, 200, { expiresIn: result.expiresIn, user: result.user });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.id);
  }
  tokenService.clearAuthCookies(res);
  sendSuccess(res, 200, null, "Logged out successfully");
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(email);
  sendSuccess(
    res,
    200,
    result,
    result.temporaryPassword
      ? "Temporary password generated successfully."
      : "If an account exists for this email, a temporary password will be generated."
  );
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword } = changePasswordSchema.parse(req.body);
  if (!req.user) {
    throw new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED");
  }

  await authService.changePassword(req.user.id, newPassword);
  tokenService.clearAuthCookies(res);
  sendSuccess(res, 200, null, "Password changed successfully. Please sign in again.");
});

export const googleAuth = catchAsync(async (_req: Request, res: Response) => {
  const authorizationUrl = authService.getGoogleAuthorizationUrl();
  res.redirect(authorizationUrl);
});

export const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const parsed = googleCallbackSchema.safeParse(req.query);
  if (!parsed.success) {
    res.redirect(`${env.FRONTEND_URL}/signin?reason=google-auth-failed`);
    return;
  }

  try {
    const { code } = parsed.data;
    const result = await authService.loginWithGoogleCode(code);
    tokenService.setAuthCookies(res, result.accessToken, result.refreshToken);
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  } catch {
    tokenService.clearAuthCookies(res);
    res.redirect(`${env.FRONTEND_URL}/signin?reason=google-auth-failed`);
  }
});
