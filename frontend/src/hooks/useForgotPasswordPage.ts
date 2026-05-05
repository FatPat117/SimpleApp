import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "../components/shared/ToastProvider";
import { useForgotPassword } from "../features/auth/authApi";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../schemas/forgotPasswordSchema";

export function useForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
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
    pushToast("A temporary password has been sent to your email.", "success");
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
