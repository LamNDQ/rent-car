"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";
import { Button } from "@app/components/ui/Button";
import { Input } from "@app/components/ui/Input";
import { CarList, CarFormModal } from "./_components";
import { useCars } from "@app/hooks";
import type { Car } from "@app/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const { cars, isLoading, error, fetchCars, createCar, updateCar, deleteCar } =
    useCars();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
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
      fetchCars();
    }
  }, [fetchCars, user]);

  // Derived state for filtering
  const filteredCars = useMemo(() => {
    if (!searchQuery.trim()) return cars;
    const lowerQuery = searchQuery.toLowerCase();
    return cars.filter(
      (car) =>
        car.brand.toLowerCase().includes(lowerQuery) ||
        car.carModel.toLowerCase().includes(lowerQuery),
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

  return (
    <div className="bg-foreground p-6 rounded-lg shadow-md w-full overflow-x-auto">
      {/* Car header table */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search brand or model..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="w-64"
          />
        </div>

        <div className="gap-2 flex-wrap flex">
          <Button variant="primary" onClick={handleOpenAddModal}>
            Add Cars
          </Button>
        </div>
      </div>

      {/* Data Section */}
      <div className="border border-zinc-200 rounded-md overflow-hidden">
        <CarList
          cars={filteredCars}
          isLoading={isLoading}
          error={error}
          onDelete={deleteCar}
          onEdit={handleOpenEditModal}
        />
      </div>

      {/* Car Form Modal */}
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
