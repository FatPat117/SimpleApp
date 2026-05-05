
import { z } from "zod";

export const updateMeSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters").optional(),
    email: z.string().trim().email("Invalid email address").optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });
