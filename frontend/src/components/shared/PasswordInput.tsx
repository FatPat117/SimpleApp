import type { InputHTMLAttributes, ReactNode } from "react";
import { usePasswordVisibility } from "../../hooks/usePasswordVisibility";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  error?: string;
  helper?: ReactNode;
  wrapperClassName?: string;
}

export function PasswordInput({ id, label, error, helper, wrapperClassName = "space-y-1.5", ...inputProps }: PasswordInputProps) {
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input id={id} type={showPassword ? "text" : "password"} className="input pr-10" {...inputProps} />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {showPassword ? (
              <>
                <path
                  d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </>
            ) : (
              <path
                d="M3 3l18 18M10.6 10.6A3 3 0 0 0 14 14m4.3 4.3A10.8 10.8 0 0 1 12 20c-5.5 0-9-6-9-6a18 18 0 0 1 4.2-4.9M9.2 5.7A10.6 10.6 0 0 1 12 5c5.5 0 9 6 9 6a18 18 0 0 1-2.4 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>
      </div>
      {helper}
      {error && <p className="error min-h-4">{error}</p>}
    </div>
  );
}
