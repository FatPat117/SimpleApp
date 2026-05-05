import { Link } from "react-router-dom";
import { FormTextInput } from "../components/shared/FormTextInput";
import { FormPageShell } from "../components/shared/FormPageShell";
import { GoogleAuthButton } from "../components/shared/GoogleAuthButton";
import { PasswordInput } from "../components/shared/PasswordInput";
import { PasswordStrengthBar } from "../components/shared/PasswordStrengthBar";
import { SubmitButton } from "../components/shared/SubmitButton";
import { useSignUpPage } from "../hooks/useSignUpPage";

export function SignUpPage() {
  const { isPending, submit, form } = useSignUpPage();
  const { register, errors, password, showPasswordStrength, validateAvailability } = form;

  return (
    <FormPageShell
      title="Create your account"
      subtitle="Please fill in the details to get started."
      containerClassName="space-y-3"
      onSubmit={submit}
      actions={
        <>
          <SubmitButton data-testid="create-btn" className="btn-primary w-full" label="Create account" pending={isPending} />
          <GoogleAuthButton />
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-slate-900 underline" to="/signin">
              Sign in
            </Link>
          </p>
        </>
      }
    >
      <FormTextInput
        id="signup-username"
        label="Name"
        {...register("username", { onBlur: () => void validateAvailability("username") })}
        placeholder="Name"
        error={errors.username?.message}
        errorClassName="error min-h-2"
      />
      <FormTextInput
        id="signup-email"
        label="Email"
        {...register("email", { onBlur: () => void validateAvailability("email") })}
        placeholder="Email"
        error={errors.email?.message}
        errorClassName="error min-h-2"
      />
      <PasswordInput
        id="signup-password"
        label="Password"
        {...register("password")}
        placeholder="Password"
        helper={showPasswordStrength ? <PasswordStrengthBar password={password ?? ""} /> : undefined}
        error={errors.password?.message}
      />
      <PasswordInput
        id="signup-confirm-password"
        label="Confirm password"
        {...register("confirmPassword")}
        placeholder="Confirm password"
        error={errors.confirmPassword?.message}
      />
    </FormPageShell>
  );
}
