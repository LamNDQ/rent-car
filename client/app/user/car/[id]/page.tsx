"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCars } from "@/hooks/useCar";
import { Container, Button, Badge } from "@/components/ui";
import { ChevronLeft, Users, Calendar, Palette, CarFront } from "lucide-react";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedCar, isLoading, error, fetchCarById } = useCars();

  useEffect(() => {
    if (params.id) {
      fetchCarById(params.id as string);
    }
  }, [params.id, fetchCarById]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-100"></div>
      </div>
    );
  }

  if (error || !selectedCar) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error || "Car not found"}
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <Button
        variant="outline"
        className="mb-6 text-zinc-400 hover:text-white -ml-2 border-none bg-transparent hover:bg-zinc-800/50"
        onClick={() => router.back()}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Gallery
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Image Placeholder */}
        <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800">
          <div className="text-zinc-800 font-black text-6xl uppercase italic opacity-50">
            {selectedCar.brand}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={selectedCar.isAvailable ? "success" : "default"}>
                {selectedCar.isAvailable ? "Available" : "Unavailable"}
              </Badge>
              <span className="text-zinc-500 text-sm">
                {selectedCar.year} Model
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {selectedCar.brand} {selectedCar.carModel}
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Experience luxury and performance with the all-new{" "}
              {selectedCar.brand} {selectedCar.carModel}. Designed for those who
              demand excellence on every journey, offering unparalleled comfort
              and state-of-the-art technology.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Seats
                </p>
                <p className="font-semibold text-zinc-100">
                  {selectedCar.seat} Adults
                </p>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Color
                </p>
                <p className="font-semibold text-zinc-100 capitalize">
                  {selectedCar.color}
                </p>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100">
                <CarFront className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Model
                </p>
                <p className="font-semibold text-zinc-100">
                  {selectedCar.carModel}
                </p>
              </div>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Year
                </p>
                <p className="font-semibold text-zinc-100">
                  {selectedCar.year}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">
                  Daily Rate
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    ${selectedCar.basePrice}
                  </span>
                  <span className="text-zinc-500 font-medium">/ day</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full text-lg py-6 rounded-xl transition-all active:scale-[0.98]"
              disabled={!selectedCar.isAvailable}
              onClick={() => router.push(`/user/booking?carId=${selectedCar._id}`)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
