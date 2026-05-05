import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Identifier is required"),
  password: z.string().trim().min(1, "Password is required"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
