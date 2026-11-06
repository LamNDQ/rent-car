import type { Car } from "@/types";
import { CarTable } from "./CarTable";

interface CarListProps {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onEdit: (car: Car) => void;
}

export function CarList({
  cars,
  isLoading,
  error,
  onDelete,
  onEdit,
}: CarListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return <CarTable cars={cars} onDelete={onDelete} onEdit={onEdit} />;
}
