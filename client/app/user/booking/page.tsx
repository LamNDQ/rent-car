"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookings, useAuth } from "@/hooks";
import type { CreateBookingPayload, Booking, BookingPreview } from "@/types";

const VOUCHER_HINTS = ["SUMMER20", "WELCOME10", "FLASH15", "VIP30"];

function getDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function CarLabel({ booking }: { booking: Booking }) {
  const name = [booking.carBrand, booking.carModel].filter(Boolean).join(" ");
  if (name) {
    return (
      <div>
        <div className="text-zinc-200 font-medium">{name}</div>
        <div className="font-mono text-[11px] text-zinc-600">{booking.carId.slice(-8)}…</div>
      </div>
    );
  }
  return (
    <span className="font-mono text-xs text-zinc-500">
      {booking.carId.slice(-8)}…
    </span>
  );
}

export default function UserBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-zinc-100" />
            <span className="text-zinc-500 text-sm tracking-wide">Loading...</span>
          </div>
        </div>
      }
    >
      <UserBookingContent />
    </Suspense>
  );
}

function UserBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthLoading } = useAuth();
  const { bookings, loading, error, createBooking, cancelBooking, previewPrice } = useBookings();

  const [formData, setFormData] = useState(() => ({
    carId: searchParams.get("carId") || "",
    startDate: getDateString(0),
    endDate: getDateString(1),
    voucherCode: "",
  }));
  const todayStr = getDateString(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<BookingPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [user, isAuthLoading, router]);

  const [debouncedForm, setDebouncedForm] = useState(formData);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedForm(formData), 400);
    return () => clearTimeout(timer);
  }, [formData]);

  const handlePreview = useCallback(async () => {
    if (!debouncedForm.carId.trim() || !debouncedForm.startDate || !debouncedForm.endDate) return;
    if (new Date(debouncedForm.endDate) <= new Date(debouncedForm.startDate)) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    setIsPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await previewPrice({
        carId: debouncedForm.carId.trim(),
        startDate: debouncedForm.startDate,
        endDate: debouncedForm.endDate,
        voucherCode: debouncedForm.voucherCode.trim() || undefined,
      });
      setPreview(result);
    } catch (err) {
      setPreview(null);
      setPreviewError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setIsPreviewLoading(false);
    }
  }, [debouncedForm, previewPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void handlePreview();
    }, 0);
    return () => clearTimeout(timer);
  }, [handlePreview]);

  if (isAuthLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    if (!formData.carId.trim()) {
      setSubmitError("Car ID is required");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setSubmitError("End date must be after start date");
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
      await createBooking(payload);
      setSuccess(true);
      setFormData((prev) => ({
        ...prev,
        startDate: getDateString(0),
        endDate: getDateString(1),
        voucherCode: "",
      }));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Create Booking Card ── */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
          <h1 className="text-xl font-semibold text-zinc-100 mb-6 tracking-tight">
            Create Booking
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Car ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Car ID
              </label>
              <input
                name="carId"
                value={formData.carId}
                onChange={(e) => setFormData((prev) => ({ ...prev, carId: e.target.value }))}
                placeholder="Enter Car ID"
                required
                className="w-full rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm px-3 py-2.5 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
            </div>

            {/* Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Start Date", key: "startDate", min: todayStr },
                { label: "End Date", key: "endDate", min: formData.startDate },
              ].map(({ label, key, min }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {label}
                  </label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={formData[key as keyof typeof formData]}
                    min={min}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    required
                    className="w-full rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-100 text-sm px-3 py-2.5 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors [scheme-dark]"
                  />
                </div>
              ))}
            </div>

            {/* Voucher */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Voucher Code{" "}
                <span className="normal-case text-zinc-600">(optional)</span>
              </label>
              <input
                name="voucherCode"
                value={formData.voucherCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    voucherCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. SUMMER20"
                className="w-full rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-100 placeholder-zinc-600 text-sm px-3 py-2.5 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {VOUCHER_HINTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, voucherCode: v }))}
                    className="text-[10px] font-medium text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700/60 hover:text-zinc-200 border border-zinc-700/50 px-2 py-0.5 rounded transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Preview */}
            {isPreviewLoading ? (
              <div className="flex items-center justify-center gap-2 p-4 rounded-md bg-zinc-800/30 border border-zinc-700/50">
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-zinc-400" />
                <span className="text-xs text-zinc-500">Calculating price…</span>
              </div>
            ) : previewError ? (
              <div className="p-3 rounded-md bg-red-950/40 border border-red-800/50 text-red-400 text-xs">
                {previewError}
              </div>
            ) : preview ? (
              <div className="rounded-md bg-zinc-800/40 border border-zinc-700/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Days</span>
                  <span className="text-zinc-300 font-medium">{preview.days}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Daily rate</span>
                  <span className="text-zinc-300 font-medium">${preview.dailyPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-700/40 my-1" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-zinc-300 font-medium">${preview.subtotal.toFixed(2)}</span>
                </div>
                {preview.discountApplied > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-500">Discount ({preview.discountApplied}%)</span>
                    <span className="text-emerald-400 font-medium">−${preview.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-zinc-700/40 my-1" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 font-semibold">Total</span>
                  <span className="text-zinc-100 font-bold">${preview.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ) : null}

            {/* Feedback banners */}
            {submitError && (
              <div className="flex items-start gap-2.5 p-3 rounded-md bg-red-950/40 border border-red-800/50 text-red-400 text-sm">
                <span className="mt-0.5 shrink-0">✕</span>
                {submitError}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3 rounded-md bg-emerald-950/40 border border-emerald-700/50 text-emerald-400 text-sm">
                <span className="mt-0.5 shrink-0">✓</span>
                Booking created successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-zinc-700" />
                  Processing…
                </span>
              ) : (
                "Create Booking"
              )}
            </button>
          </form>
        </div>

        {/* ── My Bookings Card ── */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8">
          <h2 className="text-xl font-semibold text-zinc-100 mb-5 tracking-tight">
            My Bookings
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-zinc-100" />
              <span className="text-zinc-500 text-sm">Loading bookings…</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-md bg-red-950/40 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-zinc-500 text-center py-10 text-sm">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {["Car", "Dates", "Total", "Discount", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="py-2.5 px-4 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-zinc-900/60 transition-colors group"
                    >
                      {/* Car */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <CarLabel booking={booking} />
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                        {new Date(booking.startDate).toLocaleDateString()} →{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-bold text-zinc-400">$</span>
                          <span className="text-sm font-bold text-zinc-100">
                            {booking.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-4">
                        {booking.discountApplied > 0 ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                            −{booking.discountApplied}%
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${booking.status === "confirmed"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : booking.status === "pending"
                              ? "bg-yellow-950/60 text-yellow-400 border border-yellow-800/40"
                              : "bg-zinc-950/40 text-zinc-400 border border-zinc-800/30"
                            }`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this booking?")) {
                              cancelBooking(booking.id);
                            }
                          }}
                          className="text-[11px] font-medium text-zinc-500 hover:text-red-400 border border-zinc-700 hover:border-red-800/60 px-2.5 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
