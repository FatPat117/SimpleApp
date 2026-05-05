import {
    DEFAULT_USERNAME_FALLBACK,
    USERNAME_DB_MAX_LEN,
    USERNAME_SANITIZED_MAX_LEN
} from "../constants/auth.constants";
import { User } from "../models/user.model";

export const sanitizeUsername = (input: string): string => {
  const sanitized = input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, USERNAME_SANITIZED_MAX_LEN);
  return sanitized || DEFAULT_USERNAME_FALLBACK;
};

export const generateUniqueUsername = async (base: string): Promise<string> => {
  const normalizedBase = sanitizeUsername(base);
  let candidate = normalizedBase;
  let suffix = 0;

  while (true) {
    const existingUser = await User.findOne({ where: { username: candidate } });
    if (!existingUser) {
      return candidate;
    }
    suffix += 1;
    candidate = `${normalizedBase}${suffix}`.slice(0, USERNAME_DB_MAX_LEN);
  }
};
