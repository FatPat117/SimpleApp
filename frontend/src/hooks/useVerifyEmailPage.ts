import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/shared/ToastProvider";
import { useVerifyEmail } from "../features/auth/authApi";
import { useLocation } from "react-router-dom";

type VerifyEmailLocationState = {
  email?: string;
  verificationToken?: string;
};

export function useVerifyEmailPage() {
  const navigate = useNavigate();
  const verifyEmail = useVerifyEmail();
  const { pushToast } = useToast();
  const location = useLocation();
  const state = location.state as VerifyEmailLocationState | null;

  const onVerify = async () => {
    const verificationToken = state?.verificationToken;
    if (!verificationToken) {
      pushToast("Verification token is missing. Please sign up or sign in again.", "error");
      return;
    }
    try {
      await verifyEmail.mutateAsync(verificationToken);
      pushToast("Account verified successfully.", "success");
      navigate("/signin", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      const message = axiosError.response?.data?.error?.message ?? "Unable to verify account.";
      pushToast(message, "error");
    }
  };

  return {
    email: state?.email ?? "your email address",
    hasVerificationToken: Boolean(state?.verificationToken),
    isPending: verifyEmail.isPending,
    onVerify
  };
}
