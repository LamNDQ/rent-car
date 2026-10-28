import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type ContainerProps = ComponentProps<"div">;


export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={twMerge("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
