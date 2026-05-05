import type { User } from "../models/user.model";
import { tokenService } from "../services/token.service";
import type { AuthResponse } from "../types/auth.types";

export const buildAuthResponse = (user: User): AuthResponse => {
  const payload = {
    sub: user.id,
    email: user.email,
    username: user.username
  };
  const accessToken = tokenService.signAccessToken(payload);
  const refreshToken = tokenService.signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: tokenService.getAccessExpirySeconds(),
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      requiresPasswordChange: user.requiresPasswordChange,
      isEmailVerified: user.isEmailVerified
    }
  };
};
