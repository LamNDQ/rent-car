import { Booking, CreateBookingPayload, BookingPreview } from "../../types";
import { apiClient } from "./apiClient";

export const bookingApi = {
  getAll: async (userId: string, userRole = "admin"): Promise<Booking[]> =>
    apiClient<Booking[]>("/bookings", {
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
    }),

  getMyBookings: async (userId: string, userRole = "normal"): Promise<Booking[]> =>
    apiClient<Booking[]>("/bookings/my", {
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
    }),

  previewPrice: async (
    payload: CreateBookingPayload,
    userId: string,
    userRole = "normal",
  ): Promise<BookingPreview> =>
    apiClient<BookingPreview>(
      "/bookings/preview-price",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "x-user-id": userId,
          "x-user-role": userRole,
        },
      },
    ),

  create: async (
    payload: CreateBookingPayload,
    userId: string,
    userRole = "normal",
  ): Promise<Booking> =>
    apiClient<Booking>(
      "/bookings",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "x-user-id": userId,
          "x-user-role": userRole,
        },
      },
    ),

  update: async (
    id: string,
    payload: Partial<Booking>,
    userId: string,
    userRole = "normal",
  ): Promise<Booking> =>
    apiClient<Booking>(
      `/bookings/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "x-user-id": userId,
          "x-user-role": userRole,
        },
      },
    ),

  cancel: async (id: string, userId: string, userRole = "normal"): Promise<Booking> =>
    apiClient<Booking>(`/bookings/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
    }),
};
