"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  Crown,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@app/hooks";
import { Badge, Button, Container, Footer, Header } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthLoading, logout } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const quickLinks = [
    {
      title: "Browse the fleet",
      description: "Compare cars and check live availability by date.",
      href: "/user/car",
      icon: CarFront,
      action: "Explore cars",
    },
    {
      title: "My bookings",
      description: "Review upcoming trips and manage your reservations.",
      href: "/user/booking",
      icon: CalendarCheck,
      action: "View bookings",
    },
    ...(user.role === "admin"
      ? [
          {
            title: "Admin workspace",
            description: "Manage cars, bookings, users and fleet images.",
            href: "/admin/car",
            icon: LayoutDashboard,
            action: "Open admin",
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 lg:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-white sm:px-10">
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-500/20 blur-3xl" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                        Your dashboard
                      </p>
                      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        {user.username}
                      </h1>
                      <p className="mt-1 text-sm text-white/55">{user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={user.role === "admin" ? "error" : user.role === "vip" ? "warning" : "info"}
                    className="w-fit border-white/20 bg-white/10 text-white">
                    {user.role === "vip" ? (
                      <Crown className="h-3 w-3" />
                    ) : (
                      <ShieldCheck className="h-3 w-3" />
                    )}
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Account
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.username}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
                    <Mail className="h-4 w-4" />
                  </span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5 sm:px-8">
                <p className="text-xs text-slate-400">
                  Signed in as{" "}
                  <span className="font-semibold text-slate-600">
                    {user.username}
                  </span>
                </p>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Shortcuts
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Where to next?
                  </h2>
                </div>
              </div>

              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <link.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold tracking-tight text-slate-900">
                      {link.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                      {link.description}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      {link.action}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              ))}

              {user.role === "vip" && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                    <Crown className="h-4 w-4" />
                    VIP member benefit
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-700/80">
                    Your 10% VIP discount is applied automatically at checkout
                    and stacks with valid voucher codes.
                  </p>
                </div>
              )}
            </section>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
