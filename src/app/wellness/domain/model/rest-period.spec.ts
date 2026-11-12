import { describe, it, expect } from 'vitest';
import { restPeriod } from './rest-period';
describe('rest period', () => {
  it('measures day and overnight rest using complete dates', () => {
    expect(restPeriod('2026-11-05T08:00', '2026-11-05T15:30')?.minutes).toBe(450);
    expect(restPeriod('2026-11-05T22:30', '2026-11-06T05:15')?.minutes).toBe(405);
  });
  it('rejects reversed ranges, impossible dates, zero and excessive duration', () => {
    expect(restPeriod('2026-11-05T22:30', '2026-11-05T05:15')).toBeNull();
    expect(restPeriod('2026-02-30T08:00', '2026-03-02T08:00')).toBeNull();
    expect(restPeriod('2026-11-05T08:00', '2026-11-05T08:00')).toBeNull();
    expect(restPeriod('2026-11-05T08:00', '2026-11-06T09:00')).toBeNull();
  });
});
