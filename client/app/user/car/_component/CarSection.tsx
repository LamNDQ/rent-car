"use client";

import { useEffect } from "react";
import { useCars } from "@/hooks/useCar";
import { CarList } from "./CarList";

interface CarSectionProps {
  startDate: string;
  endDate: string;
}

export function CarSection({ startDate, endDate }: CarSectionProps) {
  const { cars, isLoading, error, fetchAvailableCars } = useCars();

  useEffect(() => {
    if (startDate && endDate) {
      fetchAvailableCars(new Date(startDate), new Date(endDate));
    }
  }, [startDate, endDate, fetchAvailableCars]);

  return <CarList cars={cars} isLoading={isLoading} error={error} />;
}
