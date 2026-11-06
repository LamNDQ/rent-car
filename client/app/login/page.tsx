"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe2, LockKeyhole, User } from "lucide-react";
import { useAuth } from "@app/hooks";
import { Button, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const loggedInUser = await login(username, password);
    if (loggedInUser) {
      router.push("/");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check availability, manage your bookings and unlock your VIP rewards."
      footer={
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-slate-900 hover:text-amber-700">
            Create one
          </Link>
        </p>
      }>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="login-username"
            label="Username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="pl-10"
            placeholder="your username"
            autoComplete="username"
            required
          />
        </div>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-10 pr-11"
            placeholder="At least 6 characters"
            autoComplete="current-password"
            minLength={6}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-[2.55rem] rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          {isLoading ? "Checking credentials..." : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          or continue with
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <Button
        as="a"
        href={`${API_URL}/sso/google`}
        variant="outline"
        size="lg"
        className="w-full">
        <Globe2 className="h-4 w-4" />
        Continue with Google
      </Button>
    </AuthShell>
  );
}
