"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import { useAuth, useBookings } from "@/hooks";
import type { Booking, BookingPreview, CreateBookingPayload } from "@/types";
import {
  Badge,
  Button,
  ConfirmDialog,
  Container,
  Footer,
  Header,
  Input,
} from "@/components/ui";

const VOUCHER_HINTS = ["SUMMER20", "WELCOME10", "FLASH15", "VIP30"];

function getDateString(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CarLabel({ booking }: { booking: Booking }) {
  const name = [booking.carBrand, booking.carModel].filter(Boolean).join(" ");

  return (
    <div className="flex items-center gap-3">
      {booking.carImg ? (
        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={booking.carImg}
            alt={name || "Booked car"}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      ) : (
        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <CarFront className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {name || "Vehicle"}
        </p>
        <p className="font-mono text-[11px] text-slate-400">
          #{booking.carId.slice(-8)}
        </p>
      </div>
    </div>
  );
}

export default function UserBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Loading your bookings...
          </div>
        </div>
      }>
      <UserBookingContent />
    </Suspense>
  );
}

function UserBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthLoading } = useAuth();
  const {
    bookings,
    loading,
    error,
    createBooking,
    cancelBooking,
    previewPrice,
  } = useBookings();

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
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bookingActionError, setBookingActionError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [user, isAuthLoading, router]);

  const [debouncedForm, setDebouncedForm] = useState(formData);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedForm(formData), 400);
    return () => clearTimeout(timer);
  }, [formData]);

  const handlePreview = useCallback(async () => {
    if (
      !debouncedForm.carId.trim() ||
      !debouncedForm.startDate ||
      !debouncedForm.endDate
    ) {
      return;
    }
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      setPreview(null);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setBookingActionError(null);
    try {
      await cancelBooking(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setBookingActionError(
        err instanceof Error ? err.message : "Could not delete booking",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const canSubmit =
    Boolean(formData.carId.trim()) &&
    Boolean(formData.startDate) &&
    Boolean(formData.endDate) &&
    !isSubmitting;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Container className="py-10 lg:py-14">
          <div className="mb-8 max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              Reserve
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Book your drive
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
              Enter your trip details and we&apos;ll calculate the exact price
              before you confirm. No hidden fees.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section>
              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Trip details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose the car and the dates you want it for.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <CarFront className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
                    <Input
                      id="carId"
                      name="carId"
                      label="Car ID"
                      value={formData.carId}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          carId: event.target.value,
                        }))
                      }
                      placeholder="Paste the car ID"
                      className="pl-10 font-mono text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Picking a car manually? Open any vehicle and press{" "}
                      <span className="font-semibold text-slate-700">
                        Book this car
                      </span>
                      .
                    </p>
                    <Button
                      as={Link}
                      href="/user/car"
                      variant="ghost"
                      size="sm"
                      className="text-xs">
                      Browse cars
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
                      <Input
                        id="startDate"
                        name="startDate"
                        label="Pick-up date"
                        type="date"
                        value={formData.startDate}
                        min={todayStr}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            startDate: event.target.value,
                          }))
                        }
                        suppressHydrationWarning
                        className="pl-10"
                        required
                      />
                    </div>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3.5 top-[2.75rem] h-4 w-4 text-slate-400" />
                      <Input
                        id="endDate"
                        name="endDate"
                        label="Return date"
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            endDate: event.target.value,
                          }))
                        }
                        suppressHydrationWarning
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Input
                      id="voucherCode"
                      name="voucherCode"
                      label="Voucher code (optional)"
                      value={formData.voucherCode}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          voucherCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. SUMMER20"
                      className="font-mono uppercase tracking-wide"
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {VOUCHER_HINTS.map((voucher) => (
                        <button
                          key={voucher}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              voucherCode: voucher,
                            }))
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

                  {submitError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  {success && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      Booking created successfully. It now appears below.
                    </div>
                  )}
                </div>
              </form>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Price preview
                  </h2>
                  <Badge variant="info">Live</Badge>
                </div>

                <div className="mt-5">
                  {isPreviewLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-8">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                      <span className="text-xs text-slate-500">
                        Calculating price...
                      </span>
                    </div>
                  ) : previewError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                      {previewError}
                    </div>
                  ) : preview ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Days</span>
                        <span className="font-semibold text-slate-900">
                          {preview.days}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Daily rate</span>
                        <span className="font-semibold text-slate-900">
                          ${formatMoney(preview.dailyPrice)}
                        </span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold text-slate-900">
                          ${formatMoney(preview.subtotal)}
                        </span>
                      </div>
                      {preview.discountApplied > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-600">
                            Discount ({preview.discountApplied}%)
                          </span>
                          <span className="font-semibold text-emerald-600">
                            −${formatMoney(preview.discountAmount)}
                          </span>
                        </div>
                      )}
                      <div className="h-px bg-slate-100" />
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-semibold text-slate-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                          ${formatMoney(preview.totalPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center">
                      <Tag className="mx-auto h-5 w-5 text-slate-300" />
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        Enter a car ID and valid dates to see your exact price.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  form="booking-form"
                  variant="accent"
                  size="lg"
                  className="mt-6 w-full"
                  isLoading={isSubmitting}
                  disabled={!canSubmit}>
                  Confirm booking
                </Button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
                  The price is recalculated on confirm, so you always know the
                  final total upfront.
                </p>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <Sparkles className="h-4 w-4" />
                  Stack your savings
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-700/80">
                  VIP accounts get an automatic discount. Add a voucher code on
                  top for even more off your total.
                </p>
              </div>
            </aside>
          </div>

          <section className="mt-12">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  My bookings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Everything you&apos;ve reserved with this account.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"}
              </span>
            </div>

            {bookingActionError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {bookingActionError}
              </div>
            )}

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-16">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  <span className="text-sm text-slate-500">
                    Loading bookings...
                  </span>
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                    <CarFront className="h-6 w-6" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">
                    No bookings yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your first trip is one booking away.
                  </p>
                  <Button as={Link} href="/user/car" className="mt-5" size="sm">
                    Browse the fleet
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70">
                        {["Car", "Dates", "Total", "Discount", "Status", ""].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="whitespace-nowrap px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="transition-colors hover:bg-slate-50/60">
                          <td className="whitespace-nowrap px-5 py-4">
                            <CarLabel booking={booking} />
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                            {new Date(booking.startDate).toLocaleDateString()}
                            <span className="mx-1.5 text-slate-300">→</span>
                            {new Date(booking.endDate).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            ${formatMoney(booking.totalPrice)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            {booking.discountApplied > 0 ? (
                              <Badge variant="success">
                                −{booking.discountApplied}%
                              </Badge>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "success"
                                  : booking.status === "pending"
                                    ? "warning"
                                    : "default"
                              }>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <Button
                              variant="ghost-destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(booking)}
                              aria-label={`Delete booking for ${booking.carBrand ?? "car"}`}>
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </Container>
      </main>

      <Footer />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this booking?"
        description="This will cancel the reservation and remove it from your account. This action cannot be undone."
        confirmText="Delete booking"
        confirmVariant="ghost-destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
