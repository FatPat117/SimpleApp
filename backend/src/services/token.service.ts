import jwt, { JsonWebTokenError, TokenExpiredError, type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { Response } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

type TokenPurpose = "access" | "refresh" | "email-verification";

type UserTokenPayload = {
  sub: string;
  email: string;
  username: string;
  purpose: TokenPurpose;
};

const ACCESS_COOKIE_NAME = "accessToken";
const REFRESH_COOKIE_NAME = "refreshToken";

const parseExpirationToSeconds = (value: string): number => {
  const unit = value.slice(-1);
  const amount = Number(value.slice(0, -1));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid expiration value: ${value}`);
  }

  if (unit === "m") {
    return amount * 60;
  }

  if (unit === "h") {
    return amount * 60 * 60;
  }

  if (unit === "d") {
    return amount * 24 * 60 * 60;
  }

  throw new Error(`Unsupported expiration unit in: ${value}`);
};

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/"
});

const signToken = (payload: UserTokenPayload, secret: string, expiresIn: string): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string): UserTokenPayload & JwtPayload => {
  try {
    return jwt.verify(token, secret) as UserTokenPayload & JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError("Token expired", 401);
    }
    if (error instanceof JsonWebTokenError) {
      throw new AppError("Invalid token", 401);
    }
    throw error;
  }
};

export const tokenService = {
  accessCookieName: ACCESS_COOKIE_NAME,
  refreshCookieName: REFRESH_COOKIE_NAME,

  getAccessExpirySeconds(): number {
    return parseExpirationToSeconds(env.JWT_ACCESS_EXPIRES_IN);
  },

  signAccessToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signToken(
      { ...user, purpose: "access" },
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRES_IN
    );
  },

  signRefreshToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signToken(
      { ...user, purpose: "refresh" },
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_EXPIRES_IN
    );
  },

  signEmailVerificationToken(user: Pick<UserTokenPayload, "sub" | "email" | "username">): string {
    return signToken({ ...user, purpose: "email-verification" }, env.JWT_ACCESS_SECRET, "24h");
  },

  verifyAccessToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyToken(token, env.JWT_ACCESS_SECRET);
    if (payload.purpose !== "access") {
      throw new AppError("Invalid access token", 401);
    }
    return payload;
  },

  verifyRefreshToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyToken(token, env.JWT_REFRESH_SECRET);
    if (payload.purpose !== "refresh") {
      throw new AppError("Invalid refresh token", 401);
    }
    return payload;
  },

  verifyEmailVerificationToken(token: string): UserTokenPayload & JwtPayload {
    const payload = verifyToken(token, env.JWT_ACCESS_SECRET);
    if (payload.purpose !== "email-verification") {
      throw new AppError("Invalid verification token", 400);
    }
    return payload;
  },

  setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...baseCookieOptions(),
      maxAge: parseExpirationToSeconds(env.JWT_ACCESS_EXPIRES_IN) * 1000
    });
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...baseCookieOptions(),
      maxAge: parseExpirationToSeconds(env.JWT_REFRESH_EXPIRES_IN) * 1000
    });
  },

  clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_COOKIE_NAME, baseCookieOptions());
    response.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions());
  }
};
