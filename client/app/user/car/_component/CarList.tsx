"use client";

import { AlertCircle, CalendarSearch, CarFront } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import type { Car } from "@/types";

interface CarListProps {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
  hasDates: boolean;
}

export function CarList({ cars, isLoading, error, hasDates }: CarListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm font-semibold text-red-700">
          We couldn&apos;t load the fleet
        </p>
        <p className="mt-1 text-sm text-red-600/80">{error}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          {hasDates ? (
            <CarFront className="h-7 w-7" />
          ) : (
            <CalendarSearch className="h-7 w-7" />
          )}
        </span>
        <p className="mt-5 text-lg font-bold tracking-tight text-slate-900">
          {hasDates ? "No cars available for these dates" : "Choose your dates"}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          {hasDates
            ? "Every car in the fleet is booked for this window. Try shifting your pick-up or return date."
            : "Select both a pick-up and a return date above to see live availability."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cars.map((car, index) => (
        <CarCard key={car._id} car={car} priority={index < 3} />
      ))}
    </div>
  );
}
