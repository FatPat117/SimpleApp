import type { InputHTMLAttributes } from "react";

interface FormTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  errorClassName?: string;
  wrapperClassName?: string;
}

export function FormTextInput({
  id,
  label,
  error,
  errorClassName = "error min-h-4",
  wrapperClassName = "space-y-1.5",
  className,
  ...inputProps
}: FormTextInputProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input id={id} className={className ?? "input"} {...inputProps} />
      {error ? <p className={errorClassName}>{error}</p> : errorClassName.includes("min-h") ? <p className={errorClassName} /> : null}
    </div>
  );
}
