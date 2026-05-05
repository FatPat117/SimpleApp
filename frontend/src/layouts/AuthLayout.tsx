import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { BrandLogo } from "../components/shared/BrandLogo";

export function AuthLayout() {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const isChangePasswordRoute = location.pathname === "/change-password";

  if (isAuthenticated) {
    if (user?.requiresPasswordChange) {
      if (isChangePasswordRoute) {
        return <Outlet />;
      }
      return <Navigate to="/change-password" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-100 p-4 pt-8">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <BrandLogo />
        <Outlet />
      </div>
    </div>
  );
}
