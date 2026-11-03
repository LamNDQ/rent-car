"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@app/lib/api/userApi";
import { Button } from "@app/components/ui/Button";
import { Input } from "@app/components/ui/Input";
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
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-background p-10 shadow-lg shadow-black/30">
        <h1 className="text-3xl font-semibold text-foreground">Welcome!</h1>
        <p className="mt-2 text-sm text-foreground/80">
          Please choose a username to complete your profile.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Username
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                required
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
