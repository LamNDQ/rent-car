"use client";

import type { Booking } from "@/types/booking";
import { Button } from "@/components/ui";

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
    <td className="py-2 px-4">
      {name ? (
        <>
          <span className="font-medium text-zinc-800">{name}</span>
          <span className="block font-mono text-[11px] text-zinc-400">
            {booking.carId.slice(-8)}…
          </span>
        </>
      ) : (
        <span className="font-mono text-xs text-zinc-500">
          {booking.carId.slice(-8)}…
        </span>
      )}
    </td>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

export function BookingTable({ bookings, onDelete, onEdit }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <p className="p-4 text-center text-zinc-500">No bookings found.</p>
    );
  }

  return (
    <table className="min-w-full divide-y divide-zinc-200">
      <thead>
        <tr className="text-left text-sm font-bold text-zinc-800">
          <th className="py-3 px-4">Car</th>
          <th className="py-3 px-4">Start Date</th>
          <th className="py-3 px-4">End Date</th>
          <th className="py-3 px-4">Daily Price</th>
          <th className="py-3 px-4">Total Price</th>
          <th className="py-3 px-4">Discount</th>
          <th className="py-3 px-4">Voucher</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800">
        {bookings.map((booking) => (
          <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
            <CarCell booking={booking} />
            <td className="py-2 px-4">{formatDate(booking.startDate)}</td>
            <td className="py-2 px-4">{formatDate(booking.endDate)}</td>
            <td className="py-2 px-4">${booking.dailyPrice.toFixed(2)}</td>
            <td className="py-2 px-4 font-semibold">
              ${booking.totalPrice.toFixed(2)}
            </td>
            <td className="py-2 px-4">
              {booking.discountApplied > 0 ? (
                <span className="text-emerald-600 font-medium">
                  -{booking.discountApplied}%
                </span>
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </td>
            <td className="py-2 px-4">
              {booking.voucherCode ? (
                <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">
                  {booking.voucherCode}
                </span>
              ) : (
                <span className="text-zinc-400">—</span>
              )}
            </td>
            <td className="py-2 px-4">
              <StatusBadge status={booking.status} />
            </td>
            <td className="py-2 px-4">
              <div className="flex items-center gap-2">
                {booking.status !== "cancelled" && (
                  <Button
                    variant="secondary"
                    className="text-xs px-2 py-1"
                    onClick={() => onEdit(booking)}
                  >
                    Edit
                  </Button>
                )}
                {booking.status !== "cancelled" && (
                  <Button
                    variant="ghost-destructive"
                    className="text-xs px-2 py-1"
                    onClick={() => {
                      if (window.confirm("Delete this booking?")) {
                        onDelete(booking.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
