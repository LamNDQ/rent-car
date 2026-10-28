import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type BadgeVariant = "default" | "success" | "warning" | "error";

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
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getVariantStyles(variant),
        className,
      )}
      {...props}>
      {children}
    </span>
  );
}

// Separated logic to determine the styles for each variant.
function getVariantStyles(variant: BadgeVariant): string {
  switch (variant) {
    case "default":
      return "text-zinc-300 border border-zinc-700";
    case "success":
      return "text-emerald-400 border border-emerald-900/50";
    case "warning":
      return "text-amber-400 border border-amber-900/50";
    case "error":
      return "text-red-400 border border-red-900/50";
    default:
      return "text-zinc-300 border border-zinc-700";
  }
}
