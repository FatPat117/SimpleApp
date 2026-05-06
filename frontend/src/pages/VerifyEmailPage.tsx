import { Link } from "react-router-dom";
import { useVerifyEmailPage } from "../hooks/useVerifyEmailPage";

export function VerifyEmailPage() {
  const { email, hasVerificationToken, isPending, onVerify } = useVerifyEmailPage();

  return (
    <div className="space-y-4 py-2">
      <h1 className="text-xl font-semibold tracking-tight">Verify your account</h1>
      <p className="text-sm text-slate-600">
        This account is registered with{" "}
        <span className="font-medium text-slate-900">{email}</span>.
      </p>
      <p className="text-sm text-slate-500">
        Click confirm below to activate your account and continue to dashboard.
      </p>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        If you do not confirm this account, you will not be able to access dashboard.
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!hasVerificationToken || isPending}
          onClick={() => void onVerify()}
          className="btn-primary block w-full text-center disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Confirming..." : "Confirm account"}
        </button>
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
