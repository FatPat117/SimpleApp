const AUTH_SESSION_HINT_KEY = "auth_session_hint";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const hasAuthSessionHint = () => {
  if (!canUseStorage()) return false;
  try {
    return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
};

export const setAuthSessionHint = () => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "1");
  } catch {
    // Ignore storage errors (private mode or disabled storage).
  }
};

export const clearAuthSessionHint = () => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
  } catch {
    // Ignore storage errors (private mode or disabled storage).
  }
};
