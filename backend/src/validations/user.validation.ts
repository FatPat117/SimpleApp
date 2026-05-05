/** PATCH /me: validate body, bắt buộc ít nhất một field. */
import { z } from "zod";

export const updateMeSchema = z
  .object({
    username: z.string().trim().min(3, "Username must be at least 3 characters").optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });
