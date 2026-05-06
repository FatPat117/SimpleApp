import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/shared/ToastProvider";
import { useForgotPassword } from "../features/auth/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/forgotPasswordSchema";

export function useForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const response = await forgotPassword.mutateAsync(values.email);
    setTemporaryPassword(response.temporaryPassword);
    if (!response.temporaryPassword) {
      pushToast("Email not found.", "error");
      return;
    }
    pushToast("Temporary password is ready. Copy it and sign in again.", "success");
  };

  const onCopyTemporaryPassword = async () => {
    if (!temporaryPassword) {
      return;
    }
    await navigator.clipboard.writeText(temporaryPassword);
    pushToast("Temporary password copied.", "success");
  };

  return {
    temporaryPassword,
    isPending: forgotPassword.isPending,
    onCopyTemporaryPassword,
    goToSignIn: () => navigate("/signin"),
    submit: handleSubmit(onSubmit),
    form: {
      register,
      errors,
    },
  };
}
