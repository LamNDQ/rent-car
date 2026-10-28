"use client";
import { useState, useEffect, useCallback } from "react";
import { bookingApi } from "../lib/api/booking.Api";
import { Booking, BookingPreview, CreateBookingPayload } from "../types";
import { useAuth } from "./useAuth";

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = isAdmin
        ? await bookingApi.getAll(user.id, user.role)
        : await bookingApi.getMyBookings(user.id, user.role);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const previewPrice = useCallback(async (
    payload: CreateBookingPayload,
  ): Promise<BookingPreview> => {
    if (!user) throw new Error("Not authenticated");
    return bookingApi.previewPrice(payload, user.id, user.role);
  }, [user]);

  const createBooking = useCallback(async (
    payload: CreateBookingPayload,
  ): Promise<Booking> => {
    if (!user) throw new Error("Not authenticated");
    const booking = await bookingApi.create(payload, user.id, user.role);
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, [user]);

  const updateBooking = useCallback(async (
    id: string,
    payload: Partial<Booking>,
  ): Promise<Booking> => {
    if (!user) throw new Error("Not authenticated");
    const updated = await bookingApi.update(id, payload, user.id, user.role);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, [user]);

  const cancelBooking = useCallback(async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    await bookingApi.cancel(id, user.id, user.role);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [fetchBookings, user]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    previewPrice,
    createBooking,
    updateBooking,
    cancelBooking,
    refresh: fetchBookings,
  };
}
