"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { BookingList, BookingFormModal } from "./_components";
import { useBookings, useAuth } from "@/hooks";
import type { Booking, CreateBookingPayload } from "@/types";

export default function AdminBookingPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const { bookings, loading, error, fetchBookings, createBooking, updateBooking, cancelBooking } =
    useBookings();

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

  const handleSaveBooking = async (payload: CreateBookingPayload, id?: string) => {
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

  return (
    <div className="bg-foreground p-6 rounded-lg shadow-md w-full overflow-x-auto">
      <div className="flex items-center justify-end flex-wrap gap-4 mb-6">
        <Button variant="primary" onClick={handleOpenAddModal}>
          Add Bookings
        </Button>
      </div>

      <div className="border border-zinc-200 rounded-md overflow-hidden">
        <BookingList
          bookings={bookings}
          isLoading={loading}
          error={error}
          onDelete={cancelBooking}
          onEdit={handleOpenEditModal}
        />
      </div>

      <BookingFormModal
        key={isModalOpen ? (selectedBooking?.id || "create") : "closed"}
        isOpen={isModalOpen}
        booking={selectedBooking}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
      />
    </div>
  );
}
