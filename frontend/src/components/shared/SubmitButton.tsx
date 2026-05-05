import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
  label: string;
  pending?: boolean;
  pendingLabel?: string;
}

export function SubmitButton({ label, pending = false, pendingLabel, className, disabled, ...buttonProps }: SubmitButtonProps) {
  return (
    <button type="submit" className={className ?? "btn-primary"} disabled={disabled || pending} {...buttonProps}>
      {pending ? (pendingLabel ?? label) : label}
    </button>
  );
}
