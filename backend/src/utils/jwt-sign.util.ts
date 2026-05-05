import jwt, { JsonWebTokenError, TokenExpiredError, type JwtPayload, type SignOptions } from "jsonwebtoken";
import type { UserTokenPayload } from "../types/auth.types";
import { AppError } from "./AppError";

export const signUserJwt = (
  payload: UserTokenPayload,
  secret: string,
  expiresIn: string
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, secret, options);
};

export const verifyUserJwt = (
  token: string,
  secret: string
): UserTokenPayload & JwtPayload => {
  try {
    return jwt.verify(token, secret) as UserTokenPayload & JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError("Token expired", 401, "TOKEN_EXPIRED");
    }
    if (error instanceof JsonWebTokenError) {
      throw new AppError("Invalid token", 401, "INVALID_TOKEN");
    }
    throw error;
  }
};
