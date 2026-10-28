import { Injectable, BadRequestException } from '@nestjs/common';
import { differenceInCalendarDays } from 'date-fns';
import { VIP_DISCOUNT, VOUCHER_CATALOGUE } from '../constants';

export interface PriceBreakdown {
  days: number;
  dailyPrice: number;
  subtotal: number; // basePrice × days (before discount)
  discountApplied: number; // percentage, e.g. 30 = 30 %
  discountAmount: number; // actual amount deducted
  totalPrice: number; // subtotal - discountAmount
}

@Injectable()
export class PricingService {
  countDays(startDate: Date, endDate: Date): number {
    const days = differenceInCalendarDays(endDate, startDate);
    if (days <= 0) {
      throw new BadRequestException('endDate must be after startDate');
    }
    return days;
  }

  /**
   * Full price breakdown:
   *   subtotal      = basePrice × days
   *   discountAmount = subtotal × discountPercent / 100
   *   totalPrice    = subtotal - discountAmount
   */
  calculateBreakdown(
    basePrice: number,
    startDate: Date,
    endDate: Date,
    userRole: string,
    voucherCode?: string,
  ): { breakdown: PriceBreakdown; invalidVoucher: boolean } {
    const days = this.countDays(startDate, endDate);

    // ── Accumulate discount percentage ──────────────────────────────────────
    let discountPercent = 0;
    if (userRole?.toLowerCase() === 'vip') {
      discountPercent += VIP_DISCOUNT * 100; // e.g. 10
    }

    let invalidVoucher = false;
    if (voucherCode) {
      const voucher = VOUCHER_CATALOGUE[voucherCode.toUpperCase()];
      if (voucher === undefined) {
        invalidVoucher = true;
      } else {
        discountPercent += voucher * 100; // e.g. 20
      }
    }

    // Cap at 100 %
    discountPercent = Math.min(discountPercent, 100);

    // ── Calculate prices ─────────────────────────────────────────────────────
    const subtotal = parseFloat((basePrice * days).toFixed(2));
    const discountAmount = parseFloat(
      ((subtotal * discountPercent) / 100).toFixed(2),
    );
    const totalPrice = parseFloat((subtotal - discountAmount).toFixed(2));

    return {
      breakdown: {
        days,
        dailyPrice: basePrice,
        subtotal,
        discountApplied: discountPercent,
        discountAmount,
        totalPrice,
      },
      invalidVoucher,
    };
  }
}
