"use client";

import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { Car } from "@/types";

interface CarListProps {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
}

export function CarList({ cars, isLoading, error }: CarListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-zinc-400">
          Please select dates to see available cars.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cars.map((car) => (
        <Link key={car._id} href={`/user/car/${car._id}`} className="block">
          <Card className="group overflow-hidden flex flex-col p-0 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-300 h-full">
            <div className="relative aspect-video overflow-hidden bg-zinc-950/50">
              {/* Placeholder for car image */}

              <div className="flex items-center justify-center h-full text-zinc-700 font-black text-3xl uppercase italic opacity-20 group-hover:opacity-40 transition-opacity">
                {car.brand}
              </div>
              <div className="absolute top-3 right-3">
                <Badge
                  className="text-[10px] px-2 py-0.5"
                  variant={car.isAvailable ? "success" : "default"}>
                  {car.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4 gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-zinc-100 line-clamp-1 leading-tight text-base">
                  {car.brand} {car.carModel}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {car.year} Model
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                  {car.seat} Seats
                </span>
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded uppercase">
                  {car.color}
                </span>
              </div>

              <div className="mt-auto pt-3 border-t border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Day Rate
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold text-zinc-100">$</span>
                    <span className="text-xl font-bold text-zinc-100">
                      {car.basePrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
