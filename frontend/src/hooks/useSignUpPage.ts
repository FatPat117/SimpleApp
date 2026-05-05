import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect, useRef } from "react";
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
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });
  const password = useWatch({ control, name: "password" });
  const username = useWatch({ control, name: "username" });
  const email = useWatch({ control, name: "email" });
  const showPasswordStrength = Boolean(password);
  const availabilityRequestIdRef = useRef(0);

  useEffect(() => {
    const normalizedUsername = username?.trim() ?? "";
    const normalizedEmail = email?.trim().toLowerCase() ?? "";

    if (normalizedUsername.length > 0 && normalizedUsername.length < 3) {
      return;
    }

    const isValidEmail = normalizedEmail.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      return;
    }

    if (!normalizedUsername && !normalizedEmail) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      const requestId = availabilityRequestIdRef.current + 1;
      availabilityRequestIdRef.current = requestId;

      try {
        const result = await checkSignupAvailability({
          ...(normalizedUsername ? { username: normalizedUsername } : {}),
          ...(normalizedEmail ? { email: normalizedEmail } : {}),
        });

        if (availabilityRequestIdRef.current !== requestId) {
          return;
        }

        if (normalizedEmail) {
          if (result.emailInUse) {
            setError("email", { type: "server", message: "Email already in use." });
          } else if (errors.email?.type === "server") {
            clearErrors("email");
          }
        }

        if (normalizedUsername) {
          if (result.usernameInUse) {
            setError("username", { type: "server", message: "Username already in use." });
          } else if (errors.username?.type === "server") {
            clearErrors("username");
          }
        }
      } catch {
        // Skip inline availability errors; submit still validates on server.
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [username, email, setError, clearErrors, errors.email?.type, errors.username?.type]);

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
    },
  };
}
