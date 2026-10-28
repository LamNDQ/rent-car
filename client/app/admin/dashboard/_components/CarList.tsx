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
    // In a real app, replace this with a Skeleton Loader for better UX
    return (
      <div className="p-8 text-center animate-pulse">Loading car data...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        Error: {error}
      </div>
    );
  }

  return <CarTable cars={cars} onDelete={onDelete} onEdit={onEdit} />;
}
