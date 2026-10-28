"use client";
import { useState } from "react";
import type { Car } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CarFormModalProps {
  isOpen: boolean;
  car: Car | null; // null implies "Create" mode, otherwise "Edit"
  onClose: () => void;
  onSave: (payload: Partial<Car>, id?: string) => Promise<void>;
}

// Custom type for form state since imgUrl is edited as a comma-separated string
interface CarFormData extends Omit<Partial<Car>, "imgUrl"> {
  imgUrl?: string;
}

export function CarFormModal({
  isOpen,
  car,
  onClose,
  onSave,
}: CarFormModalProps) {
  // We use a 'key' on this component in the parent so it completely remounts
  // whenever a different car is selected, avoiding the need for useEffect resets.
  const [formData, setFormData] = useState<CarFormData>({
    brand: car?.brand || "",
    carModel: car?.carModel || "",
    year: car?.year || new Date().getFullYear(),
    color: car?.color || "",
    seat: car?.seat || 4,
    basePrice: car?.basePrice || 0,
    stock: car?.stock || 0,
    availableStock: car?.availableStock || 0,
    isAvailable: car?.isAvailable ?? true,
    imgUrl: car?.imgUrl?.join(", ") || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked
        : type === "number" ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<Car> = {
        ...formData,
        imgUrl:
          formData.imgUrl ?
            formData.imgUrl
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          : [],
      };

      await onSave(payload, car?._id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!car?._id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-200 border border-zinc-800 rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
        <h2 className="text-xl font-bold mb-6 text-zinc-800">
          {isEditMode ? `Edit Car: ${car.carModel}` : "Add New Car"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder=""
              label="Brand"
              name="brand"
              value={formData.brand as string}
              onChange={handleChange}
              required
            />
            <Input
              label="Model"
              name="carModel"
              value={formData.carModel as string}
              onChange={handleChange}
              required
            />
            <Input
              label="Year"
              type="number"
              name="year"
              value={formData.year as number}
              onChange={handleChange}
              required
            />
            <Input
              label="Color"
              name="color"
              value={formData.color as string}
              onChange={handleChange}
              required
            />
            <Input
              label="Seats"
              type="number"
              name="seat"
              value={formData.seat as number}
              onChange={handleChange}
              required
            />
            <Input
              label="Stock"
              type="number"
              name="stock"
              value={formData.stock as number}
              onChange={handleChange}
              required
            />
            <Input
              label="Available Stock"
              type="number"
              name="availableStock"
              value={formData.availableStock as number}
              onChange={handleChange}
              required
            />
            <Input
              label="Image URL (Comma separated for multiple)"
              name="imgUrl"
              value={formData.imgUrl || ""}
              onChange={handleChange}
            />
          </div>
          <Input
            label="Base Price ($)"
            type="number"
            name="basePrice"
            value={formData.basePrice as number}
            onChange={handleChange}
            required
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              checked={formData.isAvailable as boolean}
              onChange={handleChange}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-zinc-100"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium">
              Is Available For Rent
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t border-zinc-800 mt-6">
            <Button type="button" onClick={onClose} variant="primary">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} variant="secondary">
              {isEditMode ? "Save Changes" : "Create Car"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
