import Link from "next/link";
import { ArrowLeft, CarFront, ShieldCheck } from "lucide-react";
import { NavLinks } from "./nav-links";

export function SideNav() {
  return (
    <div className="flex h-full flex-col p-5">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/15">
          <CarFront className="h-5 w-5" />
        </span>
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            CarRental
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Admin workspace
          </span>
        </span>
      </Link>

      <div className="mt-8">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Manage
        </p>
        <nav className="mt-2 flex flex-col gap-1">
          <NavLinks />
        </nav>
      </div>

      <div className="mt-auto space-y-4 pt-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck className="h-5 w-5 text-amber-700" />
          <p className="mt-2 text-sm font-semibold text-amber-900">
            Admin access
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800/70">
            Fleet, booking and role changes take effect immediately.
          </p>
        </div>

        <Link
          href="/"
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to storefront
        </Link>
      </div>
    </div>
  );
}

export function MobileAdminNav() {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
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
          Storefront
        </Link>
      </div>
      <nav className="grid grid-cols-4 gap-1 px-2 pb-3">
        <NavLinks compact />
      </nav>
    </div>
  );
}
