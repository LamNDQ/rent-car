import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type CardProps = ComponentProps<"div">;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}
