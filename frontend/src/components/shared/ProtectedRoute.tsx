import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthChecked = useAppSelector((state) => state.auth.isAuthChecked);
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  if (!isAuthChecked) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  if (user?.requiresPasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}
