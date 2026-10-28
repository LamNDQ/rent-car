"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";
import { StoredUser } from "@app/types";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
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
      // Registration successful, redirect to login
      router.push("/login");
    }
  };

// Trang đăng ký 
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-background p-10 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-semibold text-foreground">Register</h1>
        <p className="mt-2 text-sm text-foreground/80">
          Create your account to access the dashboard.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Username
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground"
                required
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground"
                required
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-700 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground"
                required
                minLength={6}
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-foreground/50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/80">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium text-foreground hover:text-foreground/90"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}