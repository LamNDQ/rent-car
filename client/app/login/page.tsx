"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = await login(username, password);
    if (user) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-background p-10 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-semibold text-foreground">Login</h1>
        <p className="mt-2 text-sm text-foreground/80">
          Enter your username and password.
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

          {error ?
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          : null}

           <button
             type="submit"
             disabled={isLoading}
             className="w-full rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-foreground/50"
           >
             {isLoading ? "Checking credentials..." : "Sign In"}
           </button>
         </form>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <a
            href={`${API_URL}/sso/google`}
            className="flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100">
            Login with Google
          </a>
        </div>
        <p className="mt-6 text-center text-sm text-foreground/80">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-medium text-foreground hover:text-foreground/90">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
