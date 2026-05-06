import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { useMe } from "../features/auth/authApi";
import { logout, setAuthChecked, setAuthenticated, setUser } from "../features/auth/authSlice";
import { clearAuthSessionHint, setAuthSessionHint } from "../features/auth/sessionHint";
import { setProfile } from "../features/user/userSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const authRoutes = new Set(["/signin", "/signup", "/forgot-password", "/verify-email"]);
  const pathname = window.location.pathname;
  const isAuthRoute = authRoutes.has(pathname);
  // Always bootstrap on protected routes, including OAuth callback landings,
  // because session hint is only set by client-side login flow.
  const shouldBootstrapSession = !isAuthRoute;
  const meQuery = useMe(shouldBootstrapSession);

  useEffect(() => {
    if (isAuthRoute) {
      dispatch(setAuthChecked(true));
      return;
    }
    if (meQuery.isPending) {
      dispatch(setAuthChecked(false));
      return;
    }
    if (meQuery.data) {
      dispatch(setAuthenticated({ expiresIn: 15 * 60 }));
      dispatch(setUser(meQuery.data));
      dispatch(setProfile(meQuery.data));
      setAuthSessionHint();
      dispatch(setAuthChecked(true));
    }
    if (meQuery.isError) {
      dispatch(logout());
      dispatch(setProfile(null));
      clearAuthSessionHint();
      dispatch(setAuthChecked(true));
    }
  }, [dispatch, isAuthRoute, meQuery.data, meQuery.isError, meQuery.isPending]);
}
