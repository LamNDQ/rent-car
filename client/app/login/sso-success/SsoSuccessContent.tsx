"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { userApi } from "@app/lib/api/userApi";

export default function SsoSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      userApi.getMe(token)
        .then((userData) => {
          window.localStorage.setItem("app_user", JSON.stringify({ data: userData }));
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
    } else {
      router.push("/login");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Logging you in...</h1>
        <p className="text-sm text-foreground/80">Please wait a moment.</p>
      </div>
    </div>
  );
}
