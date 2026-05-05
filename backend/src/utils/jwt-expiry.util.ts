export const parseJwtExpiryToSeconds = (value: string): number => {
  const unit = value.slice(-1);
  const amount = Number(value.slice(0, -1));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid expiration value: ${value}`);
  }

  if (unit === "m") {
    return amount * 60;
  }

  if (unit === "h") {
    return amount * 60 * 60;
  }

  if (unit === "d") {
    return amount * 24 * 60 * 60;
  }

  throw new Error(`Unsupported expiration unit in: ${value}`);
};
