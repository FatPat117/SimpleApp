import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useAppDispatch } from "../app/hooks";
import { useToast } from "../components/shared/ToastProvider";
import { useChangePassword } from "../features/auth/authApi";
import { logout } from "../features/auth/authSlice";
import { clearAuthSessionHint } from "../features/auth/sessionHint";
import { setProfile } from "../features/user/userSlice";
import { changePasswordSchema, type ChangePasswordFormValues } from "../schemas/forgotPasswordSchema";

export function useSettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const changePassword = useChangePassword();
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
    try {
      await changePassword.mutateAsync(values.newPassword);
      dispatch(logout());
      clearAuthSessionHint();
      dispatch(setProfile(null));
      pushToast("Password changed successfully. Please sign in again.", "success");
      navigate("/signin", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      const message = axiosError.response?.data?.error?.message ?? "Unable to change password.";
      pushToast(message, "error");
    }
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
