"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CarFront,
  CircleDollarSign,
  Clock3,
  Gauge,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth, useBookings, useCars } from "@/hooks";
import { userApi } from "@/lib/api/userApi";
import type { StoredUser } from "@/types";
import { Badge, Button, Container } from "@/components/ui";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const { cars, isLoading: carsLoading, error: carsError, fetchCars } = useCars();
  const { bookings, loading: bookingsLoading, error: bookingsError } =
    useBookings();
  const [users, setUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/access-denied");
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    void fetchCars();
    userApi.findAll().then(setUsers).catch(() => setUsers([]));
  }, [user, fetchCars]);

  if (isAuthLoading || !user || user.role !== "admin") {
    return null;
  }

  const availableCars = cars.filter((car) => car.isAvailable).length;
  const totalStock = cars.reduce((total, car) => total + car.stock, 0);
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  );
  const revenue = confirmedBookings.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Cars in fleet",
      value: carsLoading ? "—" : cars.length,
      hint: `${availableCars} available today`,
      icon: CarFront,
    },
    {
      label: "Total bookings",
      value: bookingsLoading ? "—" : bookings.length,
      hint: `${pendingBookings.length} awaiting review`,
      icon: CalendarCheck,
    },
    {
      label: "Confirmed revenue",
      value: bookingsLoading ? "—" : formatCurrency(revenue),
      hint: `${confirmedBookings.length} confirmed trips`,
      icon: CircleDollarSign,
    },
    {
      label: "Registered users",
      value: users.length || "—",
      hint: "Across all roles",
      icon: Users,
    },
  ];

  const quickActions = [
    {
      title: "Add a car",
      description: "Grow the fleet and upload new images.",
      href: "/admin/car",
      icon: Plus,
      action: "Manage cars",
    },
    {
      title: "Review bookings",
      description: "Edit dates, apply vouchers or cancel trips.",
      href: "/admin/booking",
      icon: CalendarCheck,
      action: "Open bookings",
    },
    {
      title: "Manage roles",
      description: "Promote VIP customers or admin accounts.",
      href: "/admin/users",
      icon: Users,
      action: "View users",
    },
  ];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <TrendingUp className="h-3.5 w-3.5" />
              Admin overview
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {user.username}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s how the fleet and bookings are performing.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button as={Link} href="/admin/booking" variant="outline" size="sm">
              View bookings
            </Button>
            <Button as={Link} href="/admin/car" size="sm">
              <Plus className="h-4 w-4" />
              Add car
            </Button>
          </div>
        </div>

        {(carsError || bookingsError) && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some dashboard data could not be loaded. Refresh to try again.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200">
                  <stat.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Live
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Recent bookings
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  The latest reservations across the fleet.
                </p>
              </div>
              <Link
                href="/admin/booking"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CalendarCheck className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  No bookings yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New reservations will show up here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentBookings.map((booking) => {
                  const carName =
                    [booking.carBrand, booking.carModel]
                      .filter(Boolean)
                      .join(" ") || `Car #${booking.carId.slice(-6)}`;

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between gap-4 px-6 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {carName}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {new Date(booking.startDate).toLocaleDateString()} –{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">
                          ${booking.totalPrice.toFixed(0)}
                        </span>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "success"
                              : booking.status === "pending"
                                ? "warning"
                                : "default"
                          }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-slate-400" />
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Fleet snapshot
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Available cars
                    </span>
                    <span className="font-semibold text-slate-900">
                      {availableCars}/{cars.length || 0}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          cars.length > 0
                            ? Math.round((availableCars / cars.length) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Total stock
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {totalStock}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Pending
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {pendingBookings.length}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <action.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {action.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {action.description}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </Link>
              ))}
            </section>
          </div>
        </div>
      </div>
    </Container>
  );
}
