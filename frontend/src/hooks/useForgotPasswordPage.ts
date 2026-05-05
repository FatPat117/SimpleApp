import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/shared/ToastProvider";
import { useForgotPassword } from "../features/auth/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/forgotPasswordSchema";

export function useForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await forgotPassword.mutateAsync(values.email);
    pushToast("If this email exists, a temporary password will be sent.", "success");
    navigate("/signin", { replace: true });
  };

  return {
    isPending: forgotPassword.isPending,
    submit: handleSubmit(onSubmit),
    form: {
      register,
      errors,
    },
  };
}
