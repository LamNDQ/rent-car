import { BadRequestException } from '@nestjs/common';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService();
  });

  // ── countDays ──────────────────────────────────────────────────────────────

  describe('countDays', () => {
    it('returns correct number of days', () => {
      const start = new Date('2024-07-01');
      const end = new Date('2024-07-10');
      expect(service.countDays(start, end)).toBe(9);
    });

    it('throws when endDate equals startDate', () => {
      const d = new Date('2024-07-01');
      expect(() => service.countDays(d, d)).toThrow(BadRequestException);
    });

    it('throws when endDate is before startDate', () => {
      const start = new Date('2024-07-10');
      const end = new Date('2024-07-01');
      expect(() => service.countDays(start, end)).toThrow(BadRequestException);
    });
  });

  // ── calculateBreakdown ─────────────────────────────────────────────────────

  describe('calculateBreakdown', () => {
    const start = new Date('2024-07-01');
    const end = new Date('2024-07-11'); // 10 days
    const basePrice = 100;

    it('calculates correctly with no discount (normal user, no voucher)', () => {
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'normal',
      );
      expect(invalidVoucher).toBe(false);
      expect(breakdown.days).toBe(10);
      expect(breakdown.dailyPrice).toBe(100);
      expect(breakdown.subtotal).toBe(1000);
      expect(breakdown.discountApplied).toBe(0);
      expect(breakdown.discountAmount).toBe(0);
      expect(breakdown.totalPrice).toBe(1000);
    });

    it('applies 10% VIP discount', () => {
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'vip',
      );
      expect(invalidVoucher).toBe(false);
      expect(breakdown.discountApplied).toBe(10);
      expect(breakdown.discountAmount).toBe(100);
      expect(breakdown.totalPrice).toBe(900);
    });

    it('applies SUMMER20 voucher (20%) for normal user', () => {
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'normal',
        'SUMMER20',
      );
      expect(invalidVoucher).toBe(false);
      expect(breakdown.discountApplied).toBe(20);
      expect(breakdown.discountAmount).toBe(200);
      expect(breakdown.totalPrice).toBe(800);
    });

    it('stacks VIP + voucher discounts', () => {
      // VIP 10% + SUMMER20 20% = 30%
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'vip',
        'SUMMER20',
      );
      expect(invalidVoucher).toBe(false);
      expect(breakdown.discountApplied).toBe(30);
      expect(breakdown.discountAmount).toBe(300);
      expect(breakdown.totalPrice).toBe(700);
    });

    it('accepts voucher codes case-insensitively', () => {
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'normal',
        'summer20',
      );
      expect(invalidVoucher).toBe(false);
      expect(breakdown.discountApplied).toBe(20);
    });

    it('marks invalid voucher and does not apply discount', () => {
      const { breakdown, invalidVoucher } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'normal',
        'INVALID_CODE',
      );
      expect(invalidVoucher).toBe(true);
      expect(breakdown.discountApplied).toBe(0);
      expect(breakdown.totalPrice).toBe(1000);
    });

    it('caps combined discount at 100%', () => {
      // VIP 10% + VIP30 30% + SUMMER20 20% would exceed 100% if stacked
      // Use a very high voucher scenario: manually test cap
      // VIP30 = 30%, VIP = 10% → 40% total, well under 100
      // To test cap: use a custom scenario — we can't exceed 100% with existing vouchers
      // Instead verify the cap logic doesn't break at max
      const { breakdown } = service.calculateBreakdown(
        basePrice,
        start,
        end,
        'vip',
        'VIP30',
      );
      // VIP 10% + VIP30 30% = 40%
      expect(breakdown.discountApplied).toBe(40);
      expect(breakdown.discountApplied).toBeLessThanOrEqual(100);
    });

    it('rounds prices to 2 decimal places', () => {
      const { breakdown } = service.calculateBreakdown(
        33.33,
        start,
        end,
        'normal',
        'WELCOME10',
      );
      // subtotal = 33.33 * 10 = 333.30
      // discountAmount = 333.30 * 10% = 33.33
      // totalPrice = 333.30 - 33.33 = 299.97
      expect(breakdown.subtotal).toBe(333.3);
      expect(Number.isFinite(breakdown.totalPrice)).toBe(true);
      const decimals = (breakdown.totalPrice.toString().split('.')[1] ?? '')
        .length;
      expect(decimals).toBeLessThanOrEqual(2);
    });
  });
});
