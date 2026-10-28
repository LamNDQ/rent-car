import type { Booking } from "@/types/booking";
import { BookingTable } from "./BookingTable";

interface BookingListProps {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onEdit: (booking: Booking) => void;
}

export function BookingList({
  bookings,
  isLoading,
  error,
  onDelete,
  onEdit,
}: BookingListProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center animate-pulse">
        Loading booking data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return <BookingTable bookings={bookings} onDelete={onDelete} onEdit={onEdit} />;
}
