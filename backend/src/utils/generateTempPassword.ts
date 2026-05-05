/** MK tạm forgot-password: random + hậu tố để luôn có A và ký tự đặc biệt. */
import { randomBytes } from "crypto";

export const generateTempPassword = (length = 12): string => {
  const raw = randomBytes(length).toString("base64url");
  return `${raw.slice(0, length - 2)}A!`;
};
