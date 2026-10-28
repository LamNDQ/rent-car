"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const stored = window.localStorage.getItem("app_user");
    if (!stored) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-700 bg-background p-10 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-semibold text-foreground">User Dashboard</h1>
        <p className="mt-3 text-foreground/80">
          Welcome back, <span className="font-medium text-foreground">{user?.username}</span>.
        </p>

        <div className="mt-8 grid gap-4 rounded-2xl bg-zinc-900/50 p-6 text-foreground/80 border border-zinc-700">
          <div>
            <span className="block text-sm uppercase tracking-[0.18em] text-foreground/50">Email</span>
            <p className="mt-1 text-base text-foreground">{user?.email}</p>
          </div>
          <div>
            <span className="block text-sm uppercase tracking-[0.18em] text-foreground/50">Role</span>
            <p className="mt-1 text-base text-foreground">{user?.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
