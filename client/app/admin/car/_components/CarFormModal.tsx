"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ImageIcon,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { Car } from "@/types";
import { Button, Input } from "@/components/ui";
import { carApi } from "@/lib/api";

interface CarFormModalProps {
  isOpen: boolean;
  car: Car | null;
  onClose: () => void;
  onSave: (payload: Partial<Car>, id?: string) => Promise<void>;
}

export function CarFormModal({
  isOpen,
  car,
  onClose,
  onSave,
}: CarFormModalProps) {
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
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isUploading) return;

    setSaveError(null);
    setIsSubmitting(true);
    try {
      const payload: Partial<Car> = {
        ...formData,
        imgUrl: images.map((url) => url.trim()).filter(Boolean),
      };

      await onSave(payload, car?._id);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save car");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(car?._id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditMode ? "Edit car" : "Add a new car"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? `Update the details for ${car?.brand} ${car?.carModel}.`
                : "Add a vehicle to the fleet. The first image becomes the cover."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Brand"
              name="brand"
              value={formData.brand as string}
              onChange={handleChange}
              placeholder="e.g. BMW"
              required
            />
            <Input
              label="Model"
              name="carModel"
              value={formData.carModel as string}
              onChange={handleChange}
              placeholder="e.g. M4 Competition"
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
              label="Colour"
              name="color"
              value={formData.color as string}
              onChange={handleChange}
              placeholder="e.g. Black"
              required
            />
            <Input
              label="Seats"
              type="number"
              name="seat"
              value={formData.seat as number}
              onChange={handleChange}
              min={1}
              required
            />
            <Input
              label="Base price ($ / day)"
              type="number"
              name="basePrice"
              value={formData.basePrice as number}
              onChange={handleChange}
              min={0}
              required
            />
            <Input
              label="Total stock"
              type="number"
              name="stock"
              value={formData.stock as number}
              onChange={handleChange}
              min={0}
              required
            />
            <Input
              label="Available stock"
              type="number"
              name="availableStock"
              value={formData.availableStock as number}
              onChange={handleChange}
              min={0}
              required
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                  Car images
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Paste image URLs or upload files. The first image is used as
                  the cover.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}>
                <Plus className="h-3.5 w-3.5" />
                Add image
              </Button>
            </div>

            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (!isUploading && event.dataTransfer.files.length > 0) {
                  void uploadFiles(event.dataTransfer.files);
                }
              }}
              className="mb-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-7 text-center transition-colors hover:border-amber-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <UploadCloud className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-slate-700">
                Drag & drop car images here
              </p>
              <label
                className={`cursor-pointer rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 ${
                  isUploading ? "pointer-events-none opacity-50" : ""
                }`}>
                {isUploading ? "Uploading..." : "Choose files"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files && files.length > 0) {
                      void uploadFiles(files);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
              <p className="text-[11px] text-slate-400">
                JPG, PNG, WEBP, GIF or AVIF — max 5MB each
              </p>
            </div>

            {uploadError && (
              <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {uploadError}
              </p>
            )}

            <div className="space-y-3">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {url.trim() ? (
                      <Image
                        src={url.trim()}
                        alt={`Car image ${index + 1} preview`}
                        fill
                        unoptimized
                        sizes="112px"
                        className="object-cover"
                        onError={(event) => {
                          (event.target as HTMLImageElement).style.opacity = "0";
                        }}
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={url}
                      onChange={(event) =>
                        handleImageChange(index, event.target.value)
                      }
                      placeholder="https://example.com/car-image.jpg"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          Cover
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost-destructive"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Remove image ${index + 1}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              checked={formData.isAvailable as boolean}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 accent-amber-600"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Available for rent
              </span>
              <span className="block text-xs text-slate-500">
                Unavailable cars are hidden from available-date searches.
              </span>
            </span>
          </label>

          {saveError && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isUploading}>
              {isEditMode ? "Save changes" : "Create car"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
