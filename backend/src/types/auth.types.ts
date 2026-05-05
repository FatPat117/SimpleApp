/** Type dùng chung: JWT payload, response login, DTO Google. */
export type TokenPurpose = "access" | "refresh" | "email-verification";

export type UserTokenPayload = {
  sub: string;
  email: string;
  username: string;
  purpose: TokenPurpose;
};

/** User public (login/refresh) — không secrets. */
export type AuthUserPublic = {
  id: string;
  username: string;
  email: string;
  requiresPasswordChange: boolean;
  isEmailVerified: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserPublic;
};

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type GoogleUserInfoResponse = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};
