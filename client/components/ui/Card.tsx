import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type CardProps = ComponentProps<"div">;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm text-zinc-100",
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}
