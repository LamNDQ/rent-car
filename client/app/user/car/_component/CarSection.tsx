"use client";

import { useEffect } from "react";
import { useCars } from "@/hooks/useCar";
import { CarList } from "./CarList";

interface CarSectionProps {
  startDate: string;
  endDate: string;
}

export function CarSection({ startDate, endDate }: CarSectionProps) {
  const { cars, isLoading, error, fetchAvailableCars } = useCars();
  const hasDates = Boolean(startDate && endDate);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableCars(new Date(startDate), new Date(endDate));
    }
  }, [startDate, endDate, fetchAvailableCars]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {hasDates ? "Available vehicles" : "Browse the fleet"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasDates
              ? `${cars.length} ${cars.length === 1 ? "car" : "cars"} ready for your dates`
              : "Pick your dates to unlock live availability."}
          </p>
        </div>
        {hasDates && !isLoading && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live availability
          </span>
        )}
      </div>

      <CarList
        cars={cars}
        isLoading={isLoading}
        error={error}
        hasDates={hasDates}
      />
    </div>
  );
}
