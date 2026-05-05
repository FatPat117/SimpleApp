import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import type { LoginPayload, LoginResponse, SignUpPayload } from "./authTypes";
import type { UserProfile } from "../user/userTypes";

type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export const useSignup = () =>
  useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const { data } = await api.post<ApiSuccessResponse<{ email: string }>>("/auth/signup", payload);
      return data.data;
    },
  });

export const checkSignupAvailability = async (payload: { username?: string; email?: string }) => {
  const { data } = await api.get<ApiSuccessResponse<{ emailInUse: boolean; usernameInUse: boolean }>>(
    "/auth/signup/availability",
    { params: payload },
  );
  return data.data;
};

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<ApiSuccessResponse<LoginResponse>>("/auth/login", payload);
      return data.data;
    },
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<ApiSuccessResponse<null>>("/auth/forgot-password", { email });
      return data;
    },
  });

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (newPassword: string) => {
      const { data } = await api.post<ApiSuccessResponse<null>>("/auth/change-password", { newPassword });
      return data;
    },
  });

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccessResponse<{ user: UserProfile }>>("/users/me");
      return data.data.user;
    },
    retry: false,
  });
