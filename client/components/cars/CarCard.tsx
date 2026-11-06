import Image from "next/image";
import Link from "next/link";
import { CarFront, Gauge, Users } from "lucide-react";
import type { Car } from "@/types";
import { Badge } from "@/components/ui/Badge";

interface CarCardProps {
  car: Car;
  priority?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function CarCard({ car, priority = false }: CarCardProps) {
  return (
    <Link
      href={`/user/car/${car._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {car.imgUrl?.[0] ? (
          <Image
            src={car.imgUrl[0]}
            alt={`${car.brand} ${car.carModel}`}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <CarFront className="h-16 w-16" />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <Badge variant={car.isAvailable ? "success" : "default"}>
            {car.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>

        <div className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
          {car.year} model
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            {car.brand} {car.carModel}
          </h3>
          <p className="mt-1 text-xs font-medium capitalize text-slate-500">
            {car.color}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <Users className="h-3.5 w-3.5" />
            {car.seat} seats
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <Gauge className="h-3.5 w-3.5" />
            {car.stock} in fleet
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              From
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              ${formatPrice(car.basePrice)}
              <span className="ml-1 text-xs font-medium text-slate-400">
                / day
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-amber-600">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
}
