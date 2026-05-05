import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ChangePasswordPage } from "../pages/ChangePasswordPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { SignInPage } from "../pages/SignInPage";
import { SignUpPage } from "../pages/SignUpPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { MePage } from "../pages/dashboard/MePage";
import { SettingsPage } from "../pages/dashboard/SettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signin" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/signup", element: <SignUpPage /> },
      { path: "/signin", element: <SignInPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/change-password", element: <ChangePasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "me", element: <MePage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
