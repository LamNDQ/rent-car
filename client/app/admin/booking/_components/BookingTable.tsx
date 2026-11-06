"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck, CarFront, Pencil, Trash2 } from "lucide-react";
import type { Booking } from "@/types/booking";
import { Badge, Button, ConfirmDialog } from "@/components/ui";

interface BookingTableProps {
  bookings: Booking[];
  onDelete: (id: string) => void;
  onEdit: (booking: Booking) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CarCell({ booking }: { booking: Booking }) {
  const name = [booking.carBrand, booking.carModel].filter(Boolean).join(" ");

  return (
    <div className="flex items-center gap-3">
      {booking.carImg ? (
        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={booking.carImg}
            alt={name || "Booked car"}
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
          {name || "Vehicle"}
        </p>
        <p className="font-mono text-[10px] text-slate-400">
          #{booking.carId.slice(-6)}
        </p>
      </div>
    </div>
  );
}

function statusVariant(status: Booking["status"]) {
  if (status === "confirmed") return "success";
  if (status === "pending") return "warning";
  return "default";
}

export function BookingTable({
  bookings,
  onDelete,
  onEdit,
}: BookingTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  if (bookings.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <CalendarCheck className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-900">
          No bookings found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Reservations will appear here as customers book.
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <p className="border-b border-slate-100 px-5 py-2 text-[11px] text-slate-400 md:hidden">
        Swipe horizontally to see price, voucher and status.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
              {["Car", "Dates", "Price", "Voucher", "Status", "Actions"].map(
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
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <CarCell booking={booking} />
                </td>

                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                  <p className="font-medium text-slate-700">
                    {formatDate(booking.startDate)}
                  </p>
                  <p className="mt-0.5">to {formatDate(booking.endDate)}</p>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <p className="font-semibold text-slate-900">
                    ${booking.totalPrice.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    ${booking.dailyPrice.toFixed(2)} / day
                    {booking.discountApplied > 0
                      ? ` · −${booking.discountApplied}%`
                      : ""}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  {booking.voucherCode ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                      {booking.voucherCode}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  <Badge variant={statusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </td>

                <td className="whitespace-nowrap px-5 py-3.5">
                  {booking.status !== "cancelled" ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(booking)}
                        aria-label={`Edit booking for ${booking.carBrand ?? "car"}`}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost-destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(booking)}
                        aria-label={`Delete booking for ${booking.carBrand ?? "car"}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this booking?"
        description="This will cancel the reservation and remove it from the customer's booking list."
        confirmText="Delete booking"
        confirmVariant="ghost-destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
