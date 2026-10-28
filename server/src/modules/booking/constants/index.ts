export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_ERRORS = {
  NOT_FOUND: 'Booking not found',
  CONFLICT_USER: 'User already has a booking overlapping with these dates',
  CAR_NOT_FOUND: 'Car not found',
  CAR_UNAVAILABLE: 'Car is already booked for the selected dates',
  VOUCHER_INVALID: 'Voucher is invalid or expired',
  FORBIDDEN: 'You do not have permission to access this booking',
} as const;

/** Automatic 10 % discount for VIP users */
export const VIP_DISCOUNT = 0.1;

export const VOUCHER_CATALOGUE: Record<string, number> = {
  SUMMER20: 0.2,
  WELCOME10: 0.1,
  FLASH15: 0.15,
  VIP30: 0.3,
};
