import { Booking, CreateBookingPayload, BookingPreview } from "../../types";
import { apiClient } from "./apiClient";

export const bookingApi = {
  getAll: async (): Promise<Booking[]> => apiClient<Booking[]>("/bookings"),

  getMyBookings: async (): Promise<Booking[]> =>
    apiClient<Booking[]>("/bookings/my"),

  previewPrice: async (
    payload: CreateBookingPayload,
  ): Promise<BookingPreview> =>
    apiClient<BookingPreview>("/bookings/preview-price", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  create: async (payload: CreateBookingPayload): Promise<Booking> =>
    apiClient<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: async (
    id: string,
    payload: Partial<Booking>,
  ): Promise<Booking> =>
    apiClient<Booking>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  cancel: async (id: string): Promise<Booking> =>
    apiClient<Booking>(`/bookings/${id}`, {
      method: "DELETE",
    }),
};
