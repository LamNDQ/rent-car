import { IsAfterConstraint } from './booking.dto';

describe('IsAfterConstraint', () => {
  const constraint = new IsAfterConstraint();

  it('accepts endDate strictly after startDate', () => {
    expect(
      constraint.validate('2024-07-15', {
        object: { startDate: '2024-07-10' },
      } as any),
    ).toBe(true);
  });

  it('rejects endDate before or equal to startDate', () => {
    expect(
      constraint.validate('2024-07-10', {
        object: { startDate: '2024-07-10' },
      } as any),
    ).toBe(false);
    expect(
      constraint.validate('2024-07-05', {
        object: { startDate: '2024-07-10' },
      } as any),
    ).toBe(false);
  });

  it('skips the check when startDate is absent (e.g. PATCH with only endDate)', () => {
    expect(constraint.validate('2024-07-15', { object: {} } as any)).toBe(true);
  });
});
