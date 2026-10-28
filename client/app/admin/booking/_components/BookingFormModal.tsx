"use client";

import { useState, useMemo, useEffect } from "react";
import type { Booking, CreateBookingPayload } from "@/types";
import { Button, Input } from "@/components/ui";

interface BookingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: CreateBookingPayload, id?: string) => Promise<void>;
    booking?: Booking | null;
}

function getDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

const VOUCHER_HINTS = ["SUMMER20", "WELCOME10", "FLASH15", "VIP30"];

export function BookingFormModal({ isOpen, onClose, onSave, booking }: BookingFormModalProps) {
    const isEdit = !!booking;
    const [formData, setFormData] = useState({
        carId: "",
        startDate: getDateString(0),
        endDate: getDateString(1),
        voucherCode: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const todayStr = useMemo(() => getDateString(0), []);

    useEffect(() => {
        if (booking) {
            setFormData({
                carId: booking.carId,
                startDate: booking.startDate.split("T")[0],
                endDate: booking.endDate.split("T")[0],
                voucherCode: booking.voucherCode || "",
            });
        } else {
            setFormData({
                carId: "",
                startDate: getDateString(0),
                endDate: getDateString(1),
                voucherCode: "",
            });
        }
        setError(null);
    }, [booking, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "voucherCode") {
            setFormData((prev) => ({ ...prev, voucherCode: value.toUpperCase() }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 my-8">
                <h2 className="text-xl font-bold mb-6 text-zinc-800">
                    {isEdit ? "Edit Booking" : "Create New Booking"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4 text-zinc-800">
                    <Input
                        label="Car ID"
                        name="carId"
                        value={formData.carId}
                        onChange={handleChange}
                        placeholder="Enter MongoDB Car ID"
                        required
                        disabled={isEdit}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            suppressHydrationWarning
                            label="Start Date"
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            min={todayStr}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            suppressHydrationWarning
                            label="End Date"
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            min={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Input
                            label="Voucher Code (optional)"
                            name="voucherCode"
                            value={formData.voucherCode}
                            onChange={handleChange}
                            placeholder="e.g. SUMMER20"
                        />
                        <p className="mt-1 text-xs text-zinc-400">
                            Available: {VOUCHER_HINTS.join(", ")}
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-6 border-t border-zinc-100 mt-6">
                        <Button type="button" onClick={onClose} variant="secondary">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} variant="primary">
                            {isEdit ? "Update Booking" : "Create Booking"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
