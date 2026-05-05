import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAuthBootstrap } from "./hooks/useAuth";
import { ToastProvider } from "./components/shared/ToastProvider";

export default function App() {
  useAuthBootstrap();
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
