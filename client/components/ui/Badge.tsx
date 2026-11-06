import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        getVariantStyles(variant),
        className,
      )}
      {...props}>
      {children}
    </span>
  );
}

function getVariantStyles(variant: BadgeVariant): string {
  switch (variant) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "error":
      return "border-red-200 bg-red-50 text-red-700";
    case "info":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}
