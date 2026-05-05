import { FormPageShell } from "../components/shared/FormPageShell";
import { PasswordInput } from "../components/shared/PasswordInput";
import { PasswordStrengthBar } from "../components/shared/PasswordStrengthBar";
import { SubmitButton } from "../components/shared/SubmitButton";
import { useChangePasswordPage } from "../hooks/useChangePasswordPage";

export function ChangePasswordPage() {
  const { isPending, submit, form } = useChangePasswordPage();
  const { register, errors, newPassword, showPasswordStrength } = form;

  return (
    <FormPageShell
      title="Change password"
      subtitle="You must change your temporary password to continue."
      onSubmit={submit}
      actions={<SubmitButton className="btn-primary w-full" label="Update password" pending={isPending} />}
    >
      <PasswordInput
        id="change-password-new"
        label="New password"
        {...register("newPassword")}
        placeholder="New password"
        helper={showPasswordStrength ? <PasswordStrengthBar password={newPassword ?? ""} /> : undefined}
        error={errors.newPassword?.message}
      />
      <PasswordInput
        id="change-password-confirm"
        label="Confirm new password"
        {...register("confirmNewPassword")}
        placeholder="Confirm new password"
        error={errors.confirmNewPassword?.message}
      />
    </FormPageShell>
  );
}
