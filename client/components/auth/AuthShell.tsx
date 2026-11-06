import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CarFront, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/cars/car-3.jpg"
          alt="Premium car ready for the road"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-950/75 to-amber-950/40" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
              <CarFront className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight">CarRental</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                Premium fleet
              </span>
            </span>
          </Link>

          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Self-drive, without the friction
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-balance">
              The right car for every kind of journey.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Check live availability by date, preview the full price and
              confirm your booking in minutes.
            </p>

            <div className="mt-8 space-y-3 text-sm text-white/70">
              <p className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                Transparent daily pricing
              </p>
              <p className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-amber-300" />
                VIP rewards and voucher support
              </p>
            </div>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Car Rental. Drive better.
          </p>
        </div>
      </div>

      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <CarFront className="h-4 w-4" />
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900">
              CarRental
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 lg:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>

            <div className="mt-8">{children}</div>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
