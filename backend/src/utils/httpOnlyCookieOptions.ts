/** Base options cho cookie auth (HttpOnly, SameSite=strict, Secure khi prod). */
import { env } from "../config/env";

export const getHttpOnlyCookieBaseOptions = (): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "none";
  path: string;
} => {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    // Cross-domain frontend/backend in production needs SameSite=None for cookies to be sent.
    sameSite: isProduction ? "none" : "strict",
    path: "/"
  };
};
