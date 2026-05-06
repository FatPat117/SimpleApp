import { Link } from "react-router-dom";
import { FormTextInput } from "../components/shared/FormTextInput";
import { FormPageShell } from "../components/shared/FormPageShell";
import { SubmitButton } from "../components/shared/SubmitButton";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";

export function ForgotPasswordPage() {
  const { isPending, submit, form, temporaryPassword, onCopyTemporaryPassword, goToSignIn } = useForgotPasswordPage();
  const { register, errors } = form;

  return (
    <FormPageShell
      title="Forgot password"
      subtitle="Enter your registered email and we'll generate a temporary password."
      onSubmit={submit}
      actions={
        <>
          {!temporaryPassword ? (
            <>
              <SubmitButton className="btn-primary w-full" label="Generate temporary password" pending={isPending} />
              <Link className="block text-sm text-slate-700 underline" to="/signin">
                Back to sign in
              </Link>
            </>
          ) : (
            <div className="space-y-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-slate-600">Temporary password</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">{temporaryPassword}</p>
              </div>
              <button type="button" onClick={() => void onCopyTemporaryPassword()} className="btn-secondary w-full">
                Copy temporary password
              </button>
              <button type="button" onClick={goToSignIn} className="btn-primary w-full">
                Sign in again
              </button>
            </div>
          )}
        </>
      }
    >
      <FormTextInput
        id="forgot-password-email"
        label="Email"
        {...register("email")}
        placeholder="Email"
        error={errors.email?.message}
        errorClassName="error"
      />
    </FormPageShell>
  );
}
