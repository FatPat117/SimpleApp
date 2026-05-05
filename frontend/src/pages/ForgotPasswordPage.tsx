import { Link } from "react-router-dom";
import { FormTextInput } from "../components/shared/FormTextInput";
import { FormPageShell } from "../components/shared/FormPageShell";
import { SubmitButton } from "../components/shared/SubmitButton";
import { useForgotPasswordPage } from "../hooks/useForgotPasswordPage";

export function ForgotPasswordPage() {
  const { isPending, submit, form } = useForgotPasswordPage();
  const { register, errors } = form;

  return (
    <FormPageShell
      title="Forgot password"
      subtitle="Enter your registered email and we'll send a temporary password."
      onSubmit={submit}
      actions={
        <>
          <SubmitButton className="btn-primary w-full" label="Send temporary password" pending={isPending} />
          <Link className="block text-sm text-slate-700 underline" to="/signin">
            Back to sign in
          </Link>
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
