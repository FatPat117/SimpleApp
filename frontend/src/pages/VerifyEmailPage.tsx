import { Link } from "react-router-dom";
import { useVerifyEmailPage } from "../hooks/useVerifyEmailPage";

export function VerifyEmailPage() {
  const { email } = useVerifyEmailPage();

  return (
    <div className="space-y-4 py-2">
      <h1 className="text-xl font-semibold tracking-tight">Verify your email</h1>
      <p className="text-sm text-slate-600">
        We sent a verification link to{" "}
        <span className="font-medium text-slate-900">{email}</span>.
      </p>
      <p className="text-sm text-slate-500">
        Please check your inbox (and spam folder) to activate your account before signing in.
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Did not receive the email? Try signing up again or use Google sign-in.
      </div>

      <div className="space-y-2">
        <Link to="/signin" className="btn-primary block w-full text-center">
          Go to Sign in
        </Link>
        <Link to="/signup" className="btn-secondary block w-full text-center">
          Back to Sign up
        </Link>
      </div>
    </div>
  );
}
