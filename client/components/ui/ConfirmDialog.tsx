"use client";

import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  cancelText?: ReactNode;
  confirmText?: ReactNode;
  confirmVariant?: ButtonVariant;
  confirmButtonClassName?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading = false,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "primary",
  confirmButtonClassName,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10">
        <h2 className="mb-2 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            variant={confirmVariant}
            className={confirmButtonClassName}
            isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
