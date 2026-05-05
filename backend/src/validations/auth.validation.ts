import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character");

export const signUpSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: passwordSchema
});

export const checkSignUpAvailabilitySchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters").optional(),
    email: z.string().trim().toLowerCase().email("Invalid email address").optional()
  })
  .refine((data) => Boolean(data.username || data.email), {
    message: "Username or email is required"
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address")
});

export const changePasswordSchema = z.object({
  newPassword: passwordSchema
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Missing token")
});

export const googleCallbackSchema = z.object({
  code: z.string().min(1, "Missing authorization code")
});
