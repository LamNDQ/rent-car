import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "outline"
  | "ghost"
  | "ghost-destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button<T extends React.ElementType = "button">({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  as,
  ...props
}: ButtonBaseProps & { as?: T } & ComponentProps<T>) {
  const Component = (as || "button") as React.ElementType;
  return (
    <Component
      {...(props as Record<string, unknown>)}
      disabled={disabled || isLoading}
      className={twMerge(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
        getSizeStyles(size),
        getVariantStyles(variant),
        className,
      )}>
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Component>
  );
}

export function getSizeStyles(size: ButtonSize): string {
  switch (size) {
    case "sm":
      return "h-9 px-3.5 text-xs";
    case "lg":
      return "h-12 px-6 text-base";
    default:
      return "h-11 px-5 text-sm";
  }
}

export function getVariantStyles(variant: ButtonVariant): string {
  switch (variant) {
    case "primary":
      return "bg-slate-900 text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800";
    case "accent":
      return "bg-amber-600 text-white shadow-sm shadow-amber-600/20 hover:bg-amber-700";
    case "secondary":
      return "border border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200";
    case "outline":
      return "border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50";
    case "ghost":
      return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
    case "ghost-destructive":
      return "text-red-600 hover:bg-red-50 hover:text-red-700";
    default:
      return "";
  }
}
