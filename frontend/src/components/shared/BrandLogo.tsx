import { cn } from "../../lib/utils";

interface BrandLogoProps {
  align?: "center" | "left";
}

export function BrandLogo({ align = "center" }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "mb-6 flex items-center gap-2 text-slate-900",
        align === "left" ? "justify-start" : "justify-center",
      )}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white shadow-sm">
        P
      </div>
      <span className="text-lg font-semibold tracking-tight">Pita</span>
    </div>
  );
}
