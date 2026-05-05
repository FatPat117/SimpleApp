import type { ReactNode } from "react";
import { FormActions } from "./FormActions";

interface DashboardSectionCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  actionsClassName?: string;
}

export function DashboardSectionCard({
  title,
  subtitle,
  children,
  actions,
  containerClassName = "rounded-xl border border-slate-200 bg-white p-6",
  contentClassName = "mt-4",
  actionsClassName = "mt-4",
}: DashboardSectionCardProps) {
  return (
    <section className={containerClassName}>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className={contentClassName}>{children}</div>
      {actions ? <FormActions className={actionsClassName}>{actions}</FormActions> : null}
    </section>
  );
}
