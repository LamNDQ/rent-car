"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserRound } from "lucide-react";
import { userApi } from "@app/lib/api/userApi";
import { Button, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth, setStoredUser } from "@app/hooks";

export default function SsoSetupPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      await userApi.update(user.id, {
        username,
        needsProfileSetup: false,
      });

      setStoredUser({ ...user, username, needsProfileSetup: false });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      title="Finish your profile"
      subtitle="Choose a username so we can personalise your bookings and rewards."
      footer={
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          You can update this later from your dashboard.
        </p>
      }>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
            {user.email?.charAt(0).toUpperCase() ?? (
              <UserRound className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Signed in as
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.email}
            </p>
          </div>
        </div>

        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="sso-username"
            label="Username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Choose a username"
            className="pl-10"
            autoComplete="username"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Complete setup
        </Button>
      </form>
    </AuthShell>
  );
}
