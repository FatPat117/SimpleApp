import { env } from "../config/env";

export const getHttpOnlyCookieBaseOptions = (): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict";
  path: string;
} => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/"
});
