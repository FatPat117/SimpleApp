import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import type { UserProfile } from "./userTypes";

type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export const useUpdateMe = () =>
  useMutation({
    mutationFn: async (payload: Partial<Pick<UserProfile, "username" | "email">>) => {
      const { data } = await api.patch<ApiSuccessResponse<{ user: UserProfile }>>("/users/me", payload);
      return data.data.user;
    },
  });
