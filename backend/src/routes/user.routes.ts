/** /users/me — luôn cần `authenticate` (access cookie). */
import { Router } from "express";
import { getMe, updateMe } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";

export const userRouter = Router();

userRouter.get("/me", authenticate, getMe);
userRouter.patch("/me", authenticate, updateMe);
