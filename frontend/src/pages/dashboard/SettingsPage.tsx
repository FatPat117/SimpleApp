import { DashboardSectionCard } from "../../components/shared/DashboardSectionCard";
import { PasswordInput } from "../../components/shared/PasswordInput";
import { PasswordStrengthBar } from "../../components/shared/PasswordStrengthBar";
import { SubmitButton } from "../../components/shared/SubmitButton";
import { useSettingsPage } from "../../hooks/useSettingsPage";

export function SettingsPage() {
  const { isPending, submit, form } = useSettingsPage();
  const { register, errors, newPassword, showPasswordStrength } = form;

  return (
    <form onSubmit={submit}>
      <DashboardSectionCard
        title="Settings"
        subtitle="Change your password below."
        actions={
          <SubmitButton
            className="btn-primary"
            label="Change password"
            pending={isPending}
            pendingLabel="Updating..."
          />
        }
      >
        <div className="space-y-3">
          <PasswordInput
            id="settings-new-password"
            label="New password"
            {...register("newPassword")}
            placeholder="New password"
            helper={showPasswordStrength ? <PasswordStrengthBar password={newPassword ?? ""} /> : undefined}
            error={errors.newPassword?.message}
          />
          <PasswordInput
            id="settings-confirm-password"
            label="Confirm new password"
            {...register("confirmNewPassword")}
            placeholder="Confirm new password"
            error={errors.confirmNewPassword?.message}
          />
        </div>
      </DashboardSectionCard>
    </form>
  );
}
