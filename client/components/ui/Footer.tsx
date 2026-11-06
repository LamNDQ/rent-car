import Link from "next/link";
import { CarFront } from "lucide-react";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <CarFront className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  CarRental
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Premium fleet
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              A curated self-drive fleet with transparent daily pricing, live
              date-based availability and instant booking.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link className="transition-colors hover:text-slate-900" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-slate-900"
                  href="/user/car">
                  Browse cars
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-slate-900"
                  href="/user/booking">
                  My bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Account
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <Link
                  className="transition-colors hover:text-slate-900"
                  href="/login">
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-slate-900"
                  href="/register">
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-slate-900"
                  href="/dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Car Rental. All rights reserved.</p>
          <p>Built with Next.js and NestJS.</p>
        </div>
      </Container>
    </footer>
  );
}
