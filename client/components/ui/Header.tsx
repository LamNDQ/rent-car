"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, Menu, X } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Container } from "./Container";
import { Button } from "./Button";
import { useAuth } from "@app/hooks/useAuth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Cars", href: "/user/car" },
    { name: "Bookings", href: "/user/booking" },
    ...(user?.role === "admin" ? [{ name: "Admin", href: "/admin/car" }] : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/20 transition-transform group-hover:-translate-y-0.5">
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

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:border-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="max-w-28 truncate text-sm font-semibold text-slate-900">
                      {user.username}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      {user.role}
                    </span>
                  </span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" as={Link} href="/login">
                  Login
                </Button>
                <Button variant="primary" size="sm" as={Link} href="/register">
                  Get started
                </Button>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={twMerge(
                  "block rounded-xl px-3 py-2.5 text-base font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )}
                onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-4">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                    onClick={() => setIsMenuOpen(false)}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        {user.username}
                      </span>
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        {user.role}
                      </span>
                    </span>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    as={Link}
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full"
                    as={Link}
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}>
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
