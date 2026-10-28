import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost-destructive";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button<T extends React.ElementType = "button">({
  variant = "primary",
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
      {...(props as any)}
      disabled={disabled || isLoading}
      className={twMerge(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 disabled:pointer-events-none disabled:opacity-50",
        getVariantStyles(variant),
        className,
      )}>
      {children}
      {/* Simple inline loading spinner */}
      {isLoading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
    </Component>
  );
}

export function getVariantStyles(variant: ButtonVariant): string {
  switch (variant) {
    case "primary":
      return "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm";
    case "secondary":
      return "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700";
    case "outline":
      return "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100";
    case "ghost-destructive":
      return "bg-transparent text-red-500 hover:bg-red-950/30 hover:text-red-400";
    default:
      return "";
  }
}

