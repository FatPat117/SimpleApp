import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/shared/ToastProvider";
import { useChangePassword } from "../features/auth/authApi";
import { changePasswordSchema, type ChangePasswordFormValues } from "../schemas/forgotPasswordSchema";

export function useChangePasswordPage() {
  const changePassword = useChangePassword();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
  });
  const newPassword = useWatch({ control, name: "newPassword" });
  const showPasswordStrength = Boolean(newPassword);

  const onSubmit = async (values: ChangePasswordFormValues) => {
    await changePassword.mutateAsync(values.newPassword);
    pushToast("Password updated successfully.", "success");
    navigate("/signin", { replace: true });
  };

  return {
    isPending: changePassword.isPending,
    submit: handleSubmit(onSubmit),
    form: {
      register,
      errors,
      newPassword,
      showPasswordStrength,
    },
  };
}
