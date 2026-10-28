"use client";
import { useState, useCallback } from "react";
import { carApi } from "../lib/api";
import { Car } from "../types";

export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await carApi.getAll();
      setCars(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load cars");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableCars = useCallback(
    async (startDate: Date, endDate: Date) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await carApi.getAvailable(startDate, endDate);
        setCars(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load cars");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchCarById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await carApi.getOne(id);
      setSelectedCar(data);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to load car ${id}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCar = async (carPayload: Omit<Car, "_id">) => {
    setIsLoading(true);
    try {
      const newCar = await carApi.create(carPayload);
      setCars((prevCars) => [...prevCars, newCar]);
      return newCar;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create car");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCar = async (id: string, carPayload: Partial<Car>) => {
    setIsLoading(true);
    try {
      const updatedCar = await carApi.update(id, carPayload);
      setCars((prevCars) =>
        prevCars.map((car) =>
          car._id === id ? { ...car, ...updatedCar } : car,
        ),
      );
      return updatedCar;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update car");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCar = async (id: string) => {
    setIsLoading(true);
    try {
      await carApi.delete(id);
      setCars((prevCars) => prevCars.filter((car) => car._id !== id));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete car");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cars,
    selectedCar,
    isLoading,
    error,
    fetchCars,
    fetchAvailableCars,
    fetchCarById,
    createCar,
    updateCar,
    deleteCar,
  };
};
