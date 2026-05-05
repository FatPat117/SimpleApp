import { API_BASE_URL } from "../../lib/axios";

export function GoogleAuthButton() {
  return (
    <button type="button" onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)} className="btn-secondary w-full">
      <span className="inline-flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#fff" stroke="#e2e8f0" />
          <path d="M12 12h10a10 10 0 0 0-17.3-6.9L12 12Z" fill="#ea4335" />
          <path d="M12 12 4.7 5.1A10 10 0 0 0 7.8 20L12 12Z" fill="#fbbc05" />
          <path d="M12 12 7.8 20A10 10 0 0 0 22 12h-10Z" fill="#34a853" />
          <circle cx="12" cy="12" r="4.1" fill="#4285f4" />
        </svg>
        Continue with Google
      </span>
    </button>
  );
}
