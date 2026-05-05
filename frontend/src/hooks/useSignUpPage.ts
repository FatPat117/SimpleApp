import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/shared/ToastProvider";
import { checkSignupAvailability, useSignup } from "../features/auth/authApi";
import { signUpSchema, type SignUpFormValues } from "../schemas/signUpSchema";

export function useSignUpPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const { pushToast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });
  const password = useWatch({ control, name: "password" });
  const showPasswordStrength = Boolean(password);

  const validateAvailability = async (field: "username" | "email") => {
    if (field === "username") {
      const normalizedUsername = getValues("username")?.trim() ?? "";
      if (!normalizedUsername) {
        if (errors.username?.type === "server") {
          clearErrors("username");
        }
        return;
      }
      if (normalizedUsername.length < 3) {
        return;
      }
      try {
        const result = await checkSignupAvailability({ username: normalizedUsername });
        if (result.usernameInUse) {
          setError("username", { type: "server", message: "Username already in use." });
        } else if (errors.username?.type === "server") {
          clearErrors("username");
        }
      } catch {
        // Skip inline availability errors; submit still validates on server.
      }
      return;
    }

    const normalizedEmail = getValues("email")?.trim().toLowerCase() ?? "";
    if (!normalizedEmail) {
      if (errors.email?.type === "server") {
        clearErrors("email");
      }
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      return;
    }
    try {
      const result = await checkSignupAvailability({ email: normalizedEmail });
      if (result.emailInUse) {
        setError("email", { type: "server", message: "Email already in use." });
      } else if (errors.email?.type === "server") {
        clearErrors("email");
      }
    } catch {
      // Skip inline availability errors; submit still validates on server.
    }
  };

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      clearErrors(["email", "username"]);
      await signup.mutateAsync(values);
      pushToast("Account created. Please verify your email before logging in.", "success");
      navigate("/verify-email", { state: { email: values.email }, replace: true });
      reset();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      const message = axiosError.response?.data?.error?.message ?? "Unable to create account.";
      const normalized = message.toLowerCase();

      if (normalized.includes("email") && normalized.includes("already")) {
        setError("email", { type: "server", message: "Email already in use." });
      }

      if (normalized.includes("username") && normalized.includes("already")) {
        setError("username", { type: "server", message: "Username already in use." });
      }

      pushToast(message, "error");
    }
  };

  return {
    isPending: signup.isPending,
    submit: handleSubmit(onSubmit),
    form: {
      register,
      errors,
      password,
      showPasswordStrength,
      validateAvailability,
    },
  };
}
