import { useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { useMe } from "../features/auth/authApi";
import { logout, setAuthenticated, setUser } from "../features/auth/authSlice";
import { clearAuthSessionHint, hasAuthSessionHint, setAuthSessionHint } from "../features/auth/sessionHint";
import { setProfile } from "../features/user/userSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const authRoutes = new Set(["/signin", "/signup", "/forgot-password"]);
  const pathname = window.location.pathname;
  const isAuthRoute = authRoutes.has(pathname);
  const shouldBootstrapSession = !isAuthRoute && hasAuthSessionHint();
  const meQuery = useMe(shouldBootstrapSession);

  useEffect(() => {
    if (isAuthRoute) {
      return;
    }
    if (meQuery.data) {
      dispatch(setAuthenticated({ expiresIn: 15 * 60 }));
      dispatch(setUser(meQuery.data));
      dispatch(setProfile(meQuery.data));
      setAuthSessionHint();
    }
    if (meQuery.isError) {
      dispatch(logout());
      dispatch(setProfile(null));
      clearAuthSessionHint();
    }
  }, [dispatch, isAuthRoute, meQuery.data, meQuery.isError]);
}
