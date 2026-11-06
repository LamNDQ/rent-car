"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CircleDollarSign, Clock3, Plus } from "lucide-react";
import { useAuth, useBookings } from "@/hooks";
import { Button } from "@/components/ui";
import type { Booking, CreateBookingPayload } from "@/types";
import { BookingFormModal, BookingList } from "./_components";
import { useState } from "react";

export default function AdminBookingPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  } = useBookings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/access-denied");
      }
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || !user || user.role !== "admin") return null;

  const handleOpenAddModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handleSaveBooking = async (
    payload: CreateBookingPayload,
    id?: string,
  ) => {
    if (id) {
      await updateBooking(id, {
        startDate: payload.startDate,
        endDate: payload.endDate,
        voucherCode: payload.voucherCode,
      });
    } else {
      await createBooking(payload);
    }
    fetchBookings();
  };

  const confirmed = bookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const pending = bookings.filter((booking) => booking.status === "pending");
  const revenue = confirmed.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            <CalendarCheck className="h-3.5 w-3.5" />
            Reservations
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Manage bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review every reservation, adjust dates and keep revenue on track.
          </p>
        </div>

        <Button onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add booking
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {loading ? "—" : confirmed.length}
            </p>
            <p className="text-xs text-slate-500">Confirmed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Clock3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {loading ? "—" : pending.length}
            </p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <CircleDollarSign className="h-4 w-4" />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {loading
                ? "—"
                : new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(revenue)}
            </p>
            <p className="text-xs text-slate-500">Confirmed revenue</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <BookingList
          bookings={bookings}
          isLoading={loading}
          error={error}
          onDelete={cancelBooking}
          onEdit={handleOpenEditModal}
        />
      </div>

      <BookingFormModal
        key={isModalOpen ? selectedBooking?.id || "create" : "closed"}
        isOpen={isModalOpen}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
