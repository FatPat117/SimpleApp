import { AxiosError } from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useToast } from "../components/shared/ToastProvider";
import { setUser } from "../features/auth/authSlice";
import { useUpdateMe } from "../features/user/userApi";
import { setProfile } from "../features/user/userSlice";

export function useMePage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const updateMe = useUpdateMe();
  const profile = useAppSelector((state) => state.user.profile);
  const [username, setUsername] = useState(() => profile?.username ?? "");
  const [email, setEmail] = useState(() => profile?.email ?? "");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updated = await updateMe.mutateAsync({ username, email });
      dispatch(setProfile(updated));
      dispatch(setUser(updated));
      setUsername(updated.username);
      setEmail(updated.email);
      pushToast("Profile updated successfully.", "success");
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: { message?: string } }>;
      const message = axiosError.response?.data?.error?.message ?? "Unable to update profile.";
      pushToast(message, "error");
    }
  };

  return {
    isPending: updateMe.isPending,
    submit: onSubmit,
    form: {
      username,
      setUsername,
      email,
      setEmail,
    },
  };
}
