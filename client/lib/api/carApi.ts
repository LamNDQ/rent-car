const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
import { Car } from "../../types";

export const carApi = {
  getAll: async (): Promise<Car[]> => {
    const response = await fetch(`${API_BASE_URL}/cars`);
    if (!response.ok) throw new Error("Failed to fetch car");
    return response.json();
  },

  getOne: async (id: string): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`);
    if (!response.ok) throw new Error("Failed to fetch car");
    return response.json();
  },

  getAvailable: async (startDate: Date, endDate: Date): Promise<Car[]> => {
    const queryParam = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/cars/available?${queryParam.toString()}`,
    );
    if (!response.ok)
      throw new Error(
        `Failed to fetch available car: ${response.statusText}, ${response.status}`,
      );
    return response.json();
  },

  create: async (car: Omit<Car, "_id">): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        Array.isArray(errData.message) ?
          errData.message.join(", ")
          : errData.message || "Failed to create car",
      );
    }
    return response.json();
  },

  update: async (id: string, car: Partial<Car>): Promise<Car> => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        Array.isArray(errData.message) ?
          errData.message.join(", ")
          : errData.message || "Failed to update car",
      );
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        Array.isArray(errData.message) ?
          errData.message.join(", ")
          : errData.message || "Failed to delete car",
      );
    }
  },
};