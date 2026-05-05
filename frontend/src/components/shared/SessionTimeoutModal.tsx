interface SessionTimeoutModalProps {
  open: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export function SessionTimeoutModal({
  open,
  onStayLoggedIn,
  onLogout,
}: SessionTimeoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">Session timeout</h2>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;ve been on this page for a while. Do you want to stay logged in?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            data-testid="stay-logged-in-btn"
            onClick={onStayLoggedIn}
            className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Stay Logged In
          </button>
          <button
            data-testid="logout-btn"
            onClick={onLogout}
            className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
