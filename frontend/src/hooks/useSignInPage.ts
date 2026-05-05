import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { useToast } from "../components/shared/ToastProvider";
import { useLogin } from "../features/auth/authApi";
import { setAuthenticated, setUser } from "../features/auth/authSlice";
import { setAuthSessionHint } from "../features/auth/sessionHint";
import { setProfile } from "../features/user/userSlice";
import { signInSchema, type SignInFormValues } from "../schemas/signInSchema";

export function useSignInPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState("");
  const handledReasonRef = useRef<string | null>(null);
  const { pushToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (!reason || handledReasonRef.current === reason) {
      return;
    }

    handledReasonRef.current = reason;

    if (reason === "google-auth-failed") {
      setApiError("Google sign-in failed. Please try again.");
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("reason");
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const onSubmit = async (values: SignInFormValues) => {
    try {
      setApiError("");
      const response = await login.mutateAsync(values);
      dispatch(setAuthenticated({ expiresIn: response.expiresIn }));
      dispatch(setUser(response.user));
      dispatch(setProfile(response.user));
      setAuthSessionHint();
      pushToast("Signed in successfully.", "success");
      navigate(response.user.requiresPasswordChange ? "/change-password" : "/dashboard", { replace: true });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message;
      setApiError(message === "Invalid credentials" ? "Incorrect username or password." : (message ?? "Incorrect username or password."));
    }
  };

  return {
    apiError,
    isPending: login.isPending,
    submit: handleSubmit(onSubmit),
    form: {
      register,
      errors,
    },
  };
}
