import type { FormHTMLAttributes, ReactNode } from "react";
import { AuthFormHeader } from "./AuthFormHeader";
import { FormActions } from "./FormActions";

interface FormPageShellProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "children"> {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  actionsClassName?: string;
}

export function FormPageShell({
  title,
  subtitle,
  children,
  actions,
  containerClassName = "space-y-3.5",
  contentClassName,
  actionsClassName,
  ...formProps
}: FormPageShellProps) {
  return (
    <form className={containerClassName} {...formProps}>
      <AuthFormHeader title={title} subtitle={subtitle} />
      <div className={contentClassName}>{children}</div>
      {actions ? <FormActions className={actionsClassName}>{actions}</FormActions> : null}
    </form>
  );
}
