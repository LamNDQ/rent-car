import { Car } from "../../types";
import { apiClient } from "./apiClient";

export const carApi = {
  getAll: async (): Promise<Car[]> => {
    return apiClient<Car[]>("/cars");
  },

  getOne: async (id: string): Promise<Car> => {
    return apiClient<Car>(`/cars/${id}`);
  },

  getAvailable: async (startDate: Date, endDate: Date): Promise<Car[]> => {
    const queryParam = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return apiClient<Car[]>(`/cars/available?${queryParam.toString()}`);
  },

  create: async (car: Omit<Car, "_id">): Promise<Car> => {
    return apiClient<Car>("/cars", {
      method: "POST",
      body: JSON.stringify(car),
    });
  },

  update: async (id: string, car: Partial<Car>): Promise<Car> => {
    return apiClient<Car>(`/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(car),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/cars/${id}`, {
      method: "DELETE",
    });
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const result = await apiClient<{ url: string }>("/cars/upload", {
      method: "POST",
      body: formData,
    });

    return result.url;
  },
};
