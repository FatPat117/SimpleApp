import { useEffect, useState } from "react";
import { refreshClient } from "../lib/axios";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logout, setAuthenticated } from "../features/auth/authSlice";
import { clearAuthSessionHint, setAuthSessionHint } from "../features/auth/sessionHint";
import { useNavigate } from "react-router-dom";

const WARNING_BEFORE_EXPIRE_MS = 2 * 60 * 1000;

export function useSessionTimeout() {
  const expiresAt = useAppSelector((state) => state.auth.accessTokenExpiresAt);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      const left = expiresAt - Date.now();
      if (left <= WARNING_BEFORE_EXPIRE_MS) {
        setOpenModal(true);
      }
      if (left <= 0) {
        setOpenModal(false);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const handleStayLoggedIn = async () => {
    try {
      const { data } = await refreshClient.post<{ expiresIn: number }>("/auth/refresh");
      dispatch(setAuthenticated({ expiresIn: data.expiresIn }));
      setAuthSessionHint();
      setOpenModal(false);
    } catch {
      dispatch(logout());
      clearAuthSessionHint();
      navigate("/signin?reason=session-expired", { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      await refreshClient.post("/auth/logout");
    } finally {
      dispatch(logout());
      clearAuthSessionHint();
      navigate("/signin", { replace: true });
    }
  };

  return { openModal, handleStayLoggedIn, handleLogout };
}
