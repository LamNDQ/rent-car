import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends ComponentProps<"input"> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {/* Conditionally render label if provided */}
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-zinc-800">
          {label}
        </label>
      )}

      <input
        id={id}
        className={twMerge(
          "flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-100",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />

      {/* Conditionally render error message if provided */}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
