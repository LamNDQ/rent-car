"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Plus, Search, X } from "lucide-react";
import { useAuth, useCars } from "@app/hooks";
import { Button, Input } from "@app/components/ui";
import type { Car } from "@app/types";
import { CarFormModal, CarList } from "./_components";

export default function AdminCarsPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const { cars, isLoading, error, fetchCars, createCar, updateCar, deleteCar } =
    useCars();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/access-denied");
      }
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      void fetchCars();
    }
  }, [fetchCars, user]);

  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) return cars;
    const query = searchQuery.toLowerCase();
    return cars.filter(
      (car) =>
        car.brand.toLowerCase().includes(query) ||
        car.carModel.toLowerCase().includes(query) ||
        car.color.toLowerCase().includes(query),
    );
  }, [cars, searchQuery]);

  if (isAuthLoading || !user || user.role !== "admin") {
    return null;
  }

  const handleOpenAddModal = () => {
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (car: Car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  const handleSaveCar = async (payload: Partial<Car>, id?: string) => {
    if (id) {
      await updateCar(id, payload);
    } else {
      await createCar(payload as Omit<Car, "_id">);
    }
  };

  const availableCount = cars.filter((car) => car.isAvailable).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            <CarFront className="h-3.5 w-3.5" />
            Fleet
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Manage cars
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add vehicles, update pricing and keep stock accurate.
          </p>
        </div>

        <Button onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add car
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          {cars.length} total
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {availableCount} available
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          {cars.length - availableCount} unavailable
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="admin-car-search"
              placeholder="Search brand, model or colour..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredCars.length}
            </span>{" "}
            of {cars.length} cars
          </p>
        </div>

        <CarList
          cars={filteredCars}
          isLoading={isLoading}
          error={error}
          onDelete={deleteCar}
          onEdit={handleOpenEditModal}
        />
      </div>

      <CarFormModal
        key={isModalOpen ? selectedCar?._id || "create" : "closed"}
        isOpen={isModalOpen}
        car={selectedCar}
        onClose={handleCloseModal}
        onSave={handleSaveCar}
      />
    </div>
  );
}
