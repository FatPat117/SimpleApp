import type { ReactNode } from "react";

interface FormActionsProps {
  children: ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return <div className={className ?? "space-y-2"}>{children}</div>;
}
