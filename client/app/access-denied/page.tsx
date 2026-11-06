"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldX } from "lucide-react";
import { Button, Container, Footer, Header } from "@/components/ui";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Container className="max-w-xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <ShieldX className="h-8 w-8" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
              403 — Restricted area
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Access denied
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              Your account does not have the permissions required to open this
              page. If you believe this is a mistake, contact an administrator.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                Go back
              </Button>
              <Button as={Link} href="/">
                Back to home
              </Button>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
