import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  googleAuth,
  googleCallback,
  login,
  logout,
  refresh,
  signup,
  verifyEmail
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { requirePasswordChange } from "../middlewares/requirePasswordChange";

export const authRouter = Router();

authRouter.post("/signup", authRateLimiter, signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/login", authRateLimiter, login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", authenticate, logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/change-password", authenticate, requirePasswordChange, changePassword);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
