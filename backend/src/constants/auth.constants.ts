/** Hằng auth: tên cookie, bcrypt, giới hạn username, URL Google (không chứa secret). */
export const ACCESS_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

export const BCRYPT_SALT_ROUNDS = 12;

export const USERNAME_SANITIZED_MAX_LEN = 40;
export const USERNAME_DB_MAX_LEN = 50;
export const DEFAULT_USERNAME_FALLBACK = "user";

export const GOOGLE_OAUTH_ACCOUNTS_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_OAUTH_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
export const GOOGLE_OAUTH_SCOPE = "openid email profile";
