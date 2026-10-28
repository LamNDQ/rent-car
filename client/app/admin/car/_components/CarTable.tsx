"use client";
import Image from "next/image";
import type { Car } from "@/types";
import { Button } from "@/components/ui/Button";

interface CarTableProps {
  cars: Car[];
  onDelete: (id: string) => void;
  onEdit: (car: Car) => void;
}

export function CarTable({ cars, onDelete, onEdit }: CarTableProps) {
  if (cars.length === 0) {
    return <p className="p-4 text-center text-zinc-500">No cars available.</p>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 shadow-sm">
      <table className="w-full whitespace-nowrap">
        <thead>
          <tr className="text-left text-sm font-bold text-zinc-800">
            <th className="py-3 px-4">Brand</th>
            <th className="py-3 px-4">Model</th>
            <th className="py-3 px-4">Year</th>
            <th className="py-3 px-4">Color</th>
            <th className="py-3 px-4">Seats</th>
            <th className="py-3 px-4">Base Price</th>
            <th className="py-3 px-4">Total Stock</th>
            <th className="py-3 px-4">available Stock</th>
            <th className="py-3 px-4">Available</th>
            <th className="py-3 px-4">Image</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800 rounded-2xl border-zinc-800">
          {cars.map((car) => (
            <tr key={car._id} className="hover:bg-zinc-50 transition-colors">
              <td className="py-2 px-4">{car.brand}</td>
              <td className="py-2 px-4">{car.carModel}</td>
              <td className="py-2 px-4">{car.year}</td>
              <td className="py-2 px-4">{car.color}</td>
              <td className="py-2 px-4">{car.seat}</td>
              <td className="py-2 px-4">{car.basePrice}</td>
              <td className="py-2 px-4">{car.stock}</td>
              <td className="py-2 px-4">{car.availableStock}</td>
              <td className="py-2 px-4">
                <span
                  className={
                    car.isAvailable ? "text-green-600" : "text-red-600"
                  }>
                  {car.isAvailable ? "Yes" : "No"}
                </span>
              </td>
              <td className="py-2 px-4">
                {car.imgUrl && car.imgUrl.length > 0 ?
                  // Next.js Image with 'fill' requires a relative parent wrapper
                  <div className="relative h-12 w-20 rounded overflow-hidden bg-zinc-100">
                    <Image
                      src={car.imgUrl[0]}
                      alt={`${car.brand} ${car.carModel}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 80px"
                    />
                  </div>
                : <span className="text-zinc-400 italic">No image</span>}
              </td>
              <td>
                <div className="flex items-center gap-2 px-2 py-2">
                  <Button className="text-blue-600" onClick={() => onEdit(car)}>
                    Edit
                  </Button>
                  <Button
                    className="text-red-600"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this car?",
                        )
                      ) {
                        if (car._id) {
                          onDelete(car._id);
                        }
                      }
                    }}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
