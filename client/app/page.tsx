"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  Gauge,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Container,
  Footer,
  Header,
  Input,
} from "@/components/ui";
import { CarCard } from "@/components/cars/CarCard";
import { useCars } from "@/hooks";

function getDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

export default function Home() {
  const router = useRouter();
  const { cars, isLoading, fetchCars } = useCars();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartDate(getDateString(0));
      setEndDate(getDateString(2));
    }, 0);

    void fetchCars();
    return () => clearTimeout(timer);
  }, [fetchCars]);

  const featuredCars = useMemo(() => {
    return [...cars]
      .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
      .slice(0, 3);
  }, [cars]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!startDate || !endDate) {
      setDateError("Choose both a pick-up and a return date.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setDateError("The return date must be after the pick-up date.");
      return;
    }
    setDateError(null);
    router.push(
      `/user/car?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950">
          <Image
            src="/cars/car-1.jpg"
            alt="Premium car on the road"
            fill
            priority
            className="object-cover opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/70 to-transparent" />

          <Container className="relative py-20 lg:py-28">
            <div className="max-w-2xl">
              <Badge
                variant="warning"
                className="border-amber-300/30 bg-amber-300/10 text-amber-200">
                <Sparkles className="h-3 w-3" />
                Premium self-drive fleet
              </Badge>

              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                Your next <span className="text-amber-400">great drive</span>{" "}
                starts here.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                A curated fleet, transparent daily pricing and live
                date-based availability — everything you need to pick the
                right car and get moving.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  variant="accent"
                  size="lg"
                  as={Link}
                  href="/user/car"
                  className="shadow-lg shadow-amber-600/20">
                  Explore the fleet
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  as={Link}
                  href="/user/booking"
                  className="border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white">
                  My bookings
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Transparent pricing
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  Instant confirmation
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-400" />
                  VIP rewards
                </span>
              </div>
            </div>
          </Container>
        </section>

        <Container className="relative z-10 -mt-10">
          <form
            onSubmit={handleSearch}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-slate-400" />
                <Input
                  id="home-start-date"
                  label="Pick-up date"
                  type="date"
                  value={startDate}
                  min={getDateString(0)}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.55rem] h-4 w-4 text-slate-400" />
                <Input
                  id="home-end-date"
                  label="Return date"
                  type="date"
                  value={endDate}
                  min={startDate || getDateString(0)}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <Button type="submit" size="lg" className="md:mb-0">
                Check availability
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {dateError && (
              <p className="mt-3 text-xs font-medium text-red-600">{dateError}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Price confirmed before booking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                Live fleet availability
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                VIP and voucher discounts
              </span>
            </div>
          </form>
        </Container>

        <section className="py-20 lg:py-24">
          <Container>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  The fleet
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Popular right now
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                  A few favourites from the collection — each with live
                  availability and a clear daily rate.
                </p>
              </div>
              <Button variant="outline" as={Link} href="/user/car">
                View all cars
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white"
                  />
                ))
              ) : featuredCars.length > 0 ? (
                featuredCars.map((car, index) => (
                  <CarCard key={car._id} car={car} priority={index === 0} />
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <CarFront className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    The fleet is being updated
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please check back in a moment.
                  </p>
                </div>
              )}
            </div>
          </Container>
        </section>

        <section className="border-y border-slate-200 bg-white py-20 lg:py-24">
          <Container>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                Why CarRental
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A calmer way to book a car.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: CalendarDays,
                  title: "Live availability",
                  body: "Pick your dates once and only see cars that can actually fit your trip — no double bookings.",
                },
                {
                  icon: ShieldCheck,
                  title: "Pricing that adds up",
                  body: "Daily rate, rental days, VIP rewards and voucher discounts are calculated before you confirm.",
                },
                {
                  icon: Sparkles,
                  title: "Rewards built in",
                  body: "VIP members get an automatic 10% discount, and voucher codes stack on top.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 transition-colors hover:bg-white">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-20 lg:py-24">
          <Container>
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-white sm:px-12 lg:px-16">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

              <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                    Ready when you are
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    Find the car. Pick the dates. Start driving.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Browse the full fleet, compare daily rates and book with a
                    clear price breakdown.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="accent" size="lg" as={Link} href="/user/car">
                    Browse cars
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    as={Link}
                    href="/register"
                    className="border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 hover:text-white">
                    Create account
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
