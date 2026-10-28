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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2 text-zinc-100">{title}</h2>
        <p className="text-zinc-400 mb-6">{description}</p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
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
