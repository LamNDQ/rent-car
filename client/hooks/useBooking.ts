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
        ? await bookingApi.getAll()
        : await bookingApi.getMyBookings();
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
    return bookingApi.previewPrice(payload);
  }, [user]);

  const createBooking = useCallback(async (
    payload: CreateBookingPayload,
  ): Promise<Booking> => {
    if (!user) throw new Error("Not authenticated");
    const booking = await bookingApi.create(payload);
    setBookings((prev) => [booking, ...prev]);
    return booking;
  }, [user]);

  const updateBooking = useCallback(async (
    id: string,
    payload: Partial<Booking>,
  ): Promise<Booking> => {
    if (!user) throw new Error("Not authenticated");
    const updated = await bookingApi.update(id, payload);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  }, [user]);

  const cancelBooking = useCallback(async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    await bookingApi.cancel(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!user) {
        if (isMounted) {
          setBookings([]);
          setLoading(false);
        }
        return;
      }
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const data = user.role === "admin"
          ? await bookingApi.getAll()
          : await bookingApi.getMyBookings();
        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [user]);

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
