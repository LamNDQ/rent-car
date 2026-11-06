"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Check,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";
import { useCars } from "@/hooks/useCar";
import { Badge, Button } from "@/components/ui";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedCar, isLoading, error, fetchCarById } = useCars();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCarById(params.id as string);
    }
  }, [params.id, fetchCarById]);

  if (isLoading) {
    return (
      <div className="grid animate-pulse gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="aspect-[4/3] rounded-3xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-6 w-32 rounded-full bg-slate-200" />
          <div className="h-12 w-3/4 rounded-xl bg-slate-200" />
          <div className="h-24 rounded-xl bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !selectedCar) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        <CarFront className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-4 text-lg font-bold text-slate-900">
          {error || "Car not found"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          The car may have been removed from the fleet.
        </p>
        <Button className="mt-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>
      </div>
    );
  }

  const images = selectedCar.imgUrl ?? [];
  const activeIndex =
    images.length > 0 ? Math.min(activeImage, images.length - 1) : 0;

  const specs = [
    { icon: Users, label: "Seats", value: `${selectedCar.seat} adults` },
    { icon: Palette, label: "Colour", value: selectedCar.color },
    { icon: CarFront, label: "Model", value: selectedCar.carModel },
    { icon: CalendarDays, label: "Year", value: selectedCar.year },
  ];

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Back to the fleet
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <section>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
            {images.length > 0 ? (
              <Image
                src={images[activeIndex]}
                alt={`${selectedCar.brand} ${selectedCar.carModel}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <CarFront className="h-20 w-20" />
              </div>
            )}

            <div className="absolute left-4 top-4">
              <Badge variant={selectedCar.isAvailable ? "success" : "default"}>
                {selectedCar.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    index === activeIndex
                      ? "border-slate-900 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}>
                  <Image
                    src={image}
                    alt={`${selectedCar.brand} ${selectedCar.carModel} image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </button>
              ))}
            </div>
          )}

        </section>

        <aside className="lg:sticky lg:top-28 lg:row-span-2 lg:h-fit lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              <Sparkles className="h-3.5 w-3.5" />
              {selectedCar.year} model
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {selectedCar.brand} {selectedCar.carModel}
            </h1>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <spec.icon className="h-5 w-5 text-slate-400" />
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {spec.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Daily rate
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                ${formatPrice(selectedCar.basePrice)}
                <span className="ml-1 text-sm font-medium text-slate-400">
                  / day
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Final price is calculated from your rental dates and discounts.
              </p>

              <Button
                variant="accent"
                size="lg"
                className="mt-6 w-full"
                disabled={!selectedCar.isAvailable}
                onClick={() =>
                  router.push(`/user/booking?carId=${selectedCar._id}`)
                }>
                {selectedCar.isAvailable ? "Book this car" : "Currently unavailable"}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span>Instant confirmation</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Flexible dates</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-start-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            About this car
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            The {selectedCar.year} {selectedCar.brand} {selectedCar.carModel} in{" "}
            {selectedCar.color} is ready for your next trip. Availability is
            checked against your exact dates, so the car you book is the car you
            get.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Live date-based availability",
              "Instant booking confirmation",
              "VIP discounts applied automatically",
              "Voucher codes stack on top",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-600">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
