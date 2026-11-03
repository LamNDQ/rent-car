"use client";
import { useState } from "react";
import Image from "next/image";
import type { Car } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { carApi } from "@/lib/api";

interface CarFormModalProps {
  isOpen: boolean;
  car: Car | null; // null implies "Create" mode, otherwise "Edit"
  onClose: () => void;
  onSave: (payload: Partial<Car>, id?: string) => Promise<void>;
}

export function CarFormModal({
  isOpen,
  car,
  onClose,
  onSave,
}: CarFormModalProps) {
  // We use a 'key' on this component in the parent so it completely remounts
  // whenever a different car is selected, avoiding the need for useEffect resets.
  const [formData, setFormData] = useState<Partial<Car>>({
    brand: car?.brand || "",
    carModel: car?.carModel || "",
    year: car?.year || new Date().getFullYear(),
    color: car?.color || "",
    seat: car?.seat || 4,
    basePrice: car?.basePrice || 0,
    stock: car?.stock || 0,
    availableStock: car?.availableStock || 0,
    isAvailable: car?.isAvailable ?? true,
  });

  const [images, setImages] = useState<string[]>(
    car?.imgUrl && car.imgUrl.length > 0 ? [...car.imgUrl] : [""],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => prev.map((url, i) => (i === index ? value : url)));
  };

  const handleAddImage = () => {
    setImages((prev) => [...prev, ""]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    );
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      for (const file of fileList) {
        const url = await carApi.uploadImage(file);
        setImages((prev) => [...prev.filter(Boolean), url]);
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<Car> = {
        ...formData,
        imgUrl: images.map((url) => url.trim()).filter(Boolean),
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
              label="Base Price ($)"
              type="number"
              name="basePrice"
              value={formData.basePrice as number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rounded-lg border border-zinc-300 bg-zinc-100/70 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold">Car Images</p>
                <p className="text-xs text-zinc-500">
                  Paste image URLs (https://... or local /cars/car-1.jpg). The
                  first image is used as the cover.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={handleAddImage}>
                + Add Image
              </Button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!isUploading && e.dataTransfer.files.length > 0) {
                  void uploadFiles(e.dataTransfer.files);
                }
              }}
              className="mb-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-400 bg-white/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-zinc-600">
                Drag & drop car images here
              </p>
              <label
                className={`cursor-pointer rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-colors hover:bg-zinc-700 ${
                  isUploading ? "pointer-events-none opacity-50" : ""
                }`}>
                {isUploading ? "Uploading..." : "Choose files"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      void uploadFiles(files);
                    }
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="text-[11px] text-zinc-500">
                JPG, PNG, WEBP, GIF or AVIF — max 5MB each
              </p>
            </div>

            {uploadError && (
              <p className="mb-3 text-xs font-medium text-red-600">
                {uploadError}
              </p>
            )}

            <div className="space-y-3">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-md border border-zinc-300 bg-white/60 p-3 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-zinc-300 bg-zinc-200">
                    {url.trim() ?
                      <Image
                        src={url.trim()}
                        alt={`Car image ${index + 1} preview`}
                        fill
                        unoptimized
                        sizes="112px"
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0";
                        }}
                      />
                    : <span className="flex h-full items-center justify-center text-[11px] text-zinc-500">
                        No preview
                      </span>
                    }
                  </div>

                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/car-image.jpg"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="whitespace-nowrap rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-100">
                          Cover
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleRemoveImage(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isUploading}
              variant="secondary">
              {isEditMode ? "Save Changes" : "Create Car"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
