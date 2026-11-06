"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useAuth } from "@app/hooks";
import { Button, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await register({ username, password, email });
    if (success) {
      router.push("/login");
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your favourite cars, book in seconds and keep every trip in one place."
      footer={
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-slate-900 hover:text-amber-700">
            Sign in
          </Link>
        </p>
      }>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="register-username"
            label="Username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="pl-10"
            placeholder="Choose a username"
            autoComplete="username"
            required
          />
        </div>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="register-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-10"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
          <Input
            id="register-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-10 pr-11"
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
