import type { Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../constants/auth.constants";
import type { UserTokenPayload } from "../types/auth.types";
import { AppError } from "../utils/AppError";
import { getHttpOnlyCookieBaseOptions } from "../utils/httpOnlyCookieOptions";
import { parseJwtExpiryToSeconds } from "../utils/jwt-expiry.util";
import { signUserJwt, verifyUserJwt } from "../utils/jwt-sign.util";

export const tokenService = {
  accessCookieName: ACCESS_COOKIE_NAME,
  refreshCookieName: REFRESH_COOKIE_NAME,

  getAccessExpirySeconds(): number {
    return parseJwtExpiryToSeconds(env.JWT_ACCESS_EXPIRES_IN);
  },

  signAccessToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signUserJwt(
      { ...user, purpose: "access" },
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRES_IN
    );
  },

  signRefreshToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signUserJwt(
      { ...user, purpose: "refresh" },
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_EXPIRES_IN
    );
  },

  signEmailVerificationToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signUserJwt({ ...user, purpose: "email-verification" }, env.JWT_ACCESS_SECRET, "24h");
  },

  verifyAccessToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyUserJwt(token, env.JWT_ACCESS_SECRET);
    if (payload.purpose !== "access") {
      throw new AppError("Invalid access token", 401, "INVALID_ACCESS_TOKEN");
    }
    return payload;
  },

  verifyRefreshToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyUserJwt(token, env.JWT_REFRESH_SECRET);
    if (payload.purpose !== "refresh") {
      throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
    }
    return payload;
  },

  verifyEmailVerificationToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyUserJwt(token, env.JWT_ACCESS_SECRET);
    if (payload.purpose !== "email-verification") {
      throw new AppError("Invalid verification token", 400, "INVALID_VERIFICATION_TOKEN");
    }
    return payload;
  },

  setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    const cookieBase = getHttpOnlyCookieBaseOptions();
    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...cookieBase,
      maxAge: parseJwtExpiryToSeconds(env.JWT_ACCESS_EXPIRES_IN) * 1000
    });
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...cookieBase,
      maxAge: parseJwtExpiryToSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000
    });
  },

  clearAuthCookies(response: Response): void {
    const cookieBase = getHttpOnlyCookieBaseOptions();
    response.clearCookie(ACCESS_COOKIE_NAME, cookieBase);
    response.clearCookie(REFRESH_COOKIE_NAME, cookieBase);
  }
};
