"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CarFront } from "lucide-react";
import { userApi } from "@app/lib/api/userApi";
import { setStoredUser } from "@app/hooks";

export default function SsoSuccessContent() {
  const router = useRouter();

  useEffect(() => {
    userApi
      .getMe()
      .then((userData) => {
        setStoredUser(userData);
        if (userData.needsProfileSetup) {
          router.push("/login/sso-setup");
        } else {
          router.push("/");
        }
      })
      .catch((err) => {
        console.error("SSO success error:", err);
        router.push("/login?error=sso_failed");
      });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
          <CarFront className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Signing you in
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Verifying your Google account. This only takes a moment.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Securing your session...
        </div>
      </div>
    </div>
  );
}
