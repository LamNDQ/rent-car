"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Tag, X } from "lucide-react";
import type { Booking, CreateBookingPayload } from "@/types";
import { Button, Input } from "@/components/ui";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateBookingPayload, id?: string) => Promise<void>;
  booking?: Booking | null;
}

function getDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

const VOUCHER_HINTS = ["SUMMER20", "WELCOME10", "FLASH15", "VIP30"];

export function BookingFormModal({
  isOpen,
  onClose,
  onSave,
  booking,
}: BookingFormModalProps) {
  const isEdit = Boolean(booking);
  const [formData, setFormData] = useState(() => ({
    carId: booking?.carId ?? "",
    startDate: booking ? booking.startDate.split("T")[0] : getDateString(0),
    endDate: booking ? booking.endDate.split("T")[0] : getDateString(1),
    voucherCode: booking?.voucherCode ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = useMemo(() => getDateString(0), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "voucherCode") {
      setFormData((prev) => ({ ...prev, voucherCode: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.carId.trim()) {
      setError("Car ID is required");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBookingPayload = {
        carId: formData.carId.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        voucherCode: formData.voucherCode.trim() || undefined,
      };
      await onSave(payload, booking?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {isEdit ? "Edit booking" : "Add a booking"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update the dates or voucher for this reservation."
                : "Create a reservation on behalf of a customer."}
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

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <Input
            label="Car ID"
            name="carId"
            value={formData.carId}
            onChange={handleChange}
            placeholder="Enter MongoDB car ID"
            className="font-mono text-xs"
            required
            disabled={isEdit}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
              <Input
                suppressHydrationWarning
                label="Pick-up date"
                type="date"
                name="startDate"
                value={formData.startDate}
                min={todayStr}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
              <Input
                suppressHydrationWarning
                label="Return date"
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
              <Input
                label="Voucher code (optional)"
                name="voucherCode"
                value={formData.voucherCode}
                onChange={handleChange}
                placeholder="e.g. SUMMER20"
                className="pl-10 font-mono uppercase"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {VOUCHER_HINTS.map((voucher) => (
                <button
                  key={voucher}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, voucherCode: voucher }))
                  }
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    formData.voucherCode === voucher
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}>
                  {voucher}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEdit ? "Update booking" : "Create booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
