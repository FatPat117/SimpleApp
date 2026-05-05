import { Link } from "react-router-dom";
import { FormTextInput } from "../components/shared/FormTextInput";
import { FormPageShell } from "../components/shared/FormPageShell";
import { GoogleAuthButton } from "../components/shared/GoogleAuthButton";
import { PasswordInput } from "../components/shared/PasswordInput";
import { SubmitButton } from "../components/shared/SubmitButton";
import { useSignInPage } from "../hooks/useSignInPage";

export function SignInPage() {
  const { apiError, isPending, submit, form } = useSignInPage();
  const { register, errors } = form;
  return (
    <FormPageShell
      title="Sign in to your account"
      subtitle="Welcome back! Please sign in to continue."
      onSubmit={submit}
      actions={
        <>
          <SubmitButton data-testid="login-btn" className="btn-primary w-full" label="Sign in" pending={isPending} />
          <GoogleAuthButton />
          <Link data-testid="forgot-password-link" className="block text-sm text-slate-700 underline" to="/forgot-password">
            Forgot password
          </Link>
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-slate-900 underline" to="/signup">
              Sign up
            </Link>
          </p>
        </>
      }
    >
      <FormTextInput
        id="signin-identifier"
        label="Username or email"
        {...register("identifier")}
        placeholder="Username or email"
        error={errors.identifier?.message}
        errorClassName="error"
      />
      <PasswordInput
        id="signin-password"
        label="Password"
        {...register("password")}
        placeholder="Password"
        error={errors.password?.message}
      />
      {apiError && <p className="error">{apiError}</p>}
    </FormPageShell>
  );
}
