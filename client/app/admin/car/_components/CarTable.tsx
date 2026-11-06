"use client";

import { useState } from "react";
import Image from "next/image";
import { CarFront, Pencil, Trash2 } from "lucide-react";
import type { Car } from "@/types";
import { Badge, Button, ConfirmDialog } from "@/components/ui";

interface CarTableProps {
  cars: Car[];
  onDelete: (id: string) => void;
  onEdit: (car: Car) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function CarTable({ cars, onDelete, onEdit }: CarTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);

  if (cars.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <CarFront className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-900">
          No cars found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different search or add a new vehicle.
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    if (deleteTarget?._id) {
      onDelete(deleteTarget._id);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <p className="border-b border-slate-100 px-5 py-2 text-[11px] text-slate-400 md:hidden">
        Swipe horizontally to see pricing, stock and actions.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
              {["Car", "Details", "Price/day", "Stock", "Status", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cars.map((car) => (
              <tr
                key={car._id}
                className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {car.imgUrl && car.imgUrl.length > 0 ? (
                      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={car.imgUrl[0]}
                          alt={`${car.brand} ${car.carModel}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <CarFront className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {car.brand} {car.carModel}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        #{car._id?.slice(-6)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                  <p>
                    {car.year} · <span className="capitalize">{car.color}</span>
                  </p>
                  <p className="mt-0.5">{car.seat} seats</p>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-slate-900">
                  ${formatPrice(car.basePrice)}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {car.availableStock}
                  </span>{" "}
                  / {car.stock}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <Badge variant={car.isAvailable ? "success" : "default"}>
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(car)}
                      aria-label={`Edit ${car.brand} ${car.carModel}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost-destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(car)}
                      aria-label={`Delete ${car.brand} ${car.carModel}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this car?"
        description={`This will permanently remove ${
          deleteTarget ? `${deleteTarget.brand} ${deleteTarget.carModel}` : "this car"
        } from the fleet.`}
        confirmText="Delete car"
        confirmVariant="ghost-destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
