export interface Booking {
    id: string;
    userId: string;
    carId: string;
    startDate: string;
    endDate: string;
    dailyPrice: number;
    subtotal: number;
    discountApplied: number;
    discountAmount: number;
    totalPrice: number;
    voucherCode?: string;
    status: "confirmed" | "pending" | "cancelled";
    userRole?: string;
    carBrand?: string;
    carModel?: string;
    carImg?: string;
    createdAt: string;
    car?: {
        brand: string;
        carModel: string;
        year: number;
        color: string;
        imgUrl?: string[];
    };
}

export interface CreateBookingPayload {
    carId: string;
    startDate: string;
    endDate: string;
    voucherCode?: string;
}

export interface BookingPreview {
    days: number;
    dailyPrice: number;
    subtotal: number;
    discountApplied: number;
    discountAmount: number;
    totalPrice: number;
}