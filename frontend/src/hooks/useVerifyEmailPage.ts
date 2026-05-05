import { useLocation } from "react-router-dom";

type VerifyEmailLocationState = {
  email?: string;
};

export function useVerifyEmailPage() {
  const location = useLocation();
  const state = location.state as VerifyEmailLocationState | null;

  return { email: state?.email ?? "your email address" };
}
