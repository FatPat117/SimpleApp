import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "RATE_LIMIT_EXCEEDED", "Too many requests, please try again later.");
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, "AUTH_RATE_LIMIT_EXCEEDED", "Too many auth attempts, please try again later.");
  }
});

export const refreshRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "REFRESH_RATE_LIMIT_EXCEEDED",
      "Too many refresh attempts, please try again later."
    );
  }
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      429,
      "FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED",
      "Too many password reset requests, please try again later."
    );
  }
});
