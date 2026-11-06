"use client";

import { CalendarDays, Sparkles } from "lucide-react";
import { Container, Input } from "@/components/ui";

export interface PageBannerProps {
  title: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

function getDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

export function PageBanner({
  title,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
}: PageBannerProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <Container className="py-10 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              The collection
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
              Choose your pick-up and return dates. We&apos;ll only show cars
              that can actually fit your trip.
            </p>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
                <Input
                  id="fleet-start-date"
                  label="Pick-up date"
                  type="date"
                  value={startDate}
                  min={getDateString(0)}
                  onChange={(event) => onStartDateChange?.(event.target.value)}
                  className="bg-white pl-10"
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
                <Input
                  id="fleet-end-date"
                  label="Return date"
                  type="date"
                  value={endDate}
                  min={startDate || getDateString(0)}
                  onChange={(event) => onEndDateChange?.(event.target.value)}
                  className="bg-white pl-10"
                />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Availability updates automatically as you change the dates.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
