"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Crown,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { StoredUser } from "@app/types";
import { Button } from "@app/components/ui";
import { userApi } from "@app/lib/api/userApi";

export interface UserRoleModalProps {
  isOpen: boolean;
  user: StoredUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  {
    value: "normal",
    label: "Normal user",
    description: "Standard access to browse and book cars.",
    icon: UserRound,
  },
  {
    value: "vip",
    label: "VIP member",
    description: "Receives automatic booking discounts.",
    icon: Crown,
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Full access to cars, bookings and users.",
    icon: ShieldCheck,
  },
];

export function UserRoleModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: UserRoleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleRoleChange = async (newRole: string) => {
    if (newRole === user.role) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await userApi.update(user.id, { role: newRole });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Edit role
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a new role for{" "}
              <span className="font-semibold text-slate-700">
                {user.username}
              </span>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 p-6">
          {error && (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {ROLES.map((role) => {
            const RoleIcon = role.icon;
            const isCurrent = user.role === role.value;

            return (
              <button
                key={role.value}
                type="button"
                onClick={() => handleRoleChange(role.value)}
                disabled={isLoading}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all disabled:opacity-60 ${
                  isCurrent
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                }`}>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isCurrent
                      ? "bg-white/10 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                  <RoleIcon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {role.label}
                    {isCurrent && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                        Current
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isCurrent ? "text-white/60" : "text-slate-500"
                    }`}>
                    {role.description}
                  </span>
                </span>
                {isCurrent ? (
                  <Check className="h-4 w-4 shrink-0 text-white/70" />
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Set
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
