import { Link, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { BrandLogo } from "../components/shared/BrandLogo";
import { SessionTimeoutModal } from "../components/shared/SessionTimeoutModal";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/me", label: "Me" },
  { to: "/dashboard/settings", label: "Settings" },
];

export function DashboardLayout() {
  const profile = useAppSelector((state) => state.user.profile);
  const location = useLocation();
  const { openModal, handleLogout, handleStayLoggedIn } = useSessionTimeout();

  return (
    <div className="flex min-h-screen bg-[#f7f8fb]">
      <aside className="w-60 border-r border-slate-200 bg-white px-4 py-5">
        <BrandLogo align="left" />
        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                location.pathname === item.to ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 rounded-md bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">{profile?.username ?? "User"}</p>
          <p>{profile?.email ?? "No email"}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-md border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-5 md:p-6">
        <Outlet />
      </main>
      <SessionTimeoutModal open={openModal} onStayLoggedIn={handleStayLoggedIn} onLogout={handleLogout} />
    </div>
  );
}
