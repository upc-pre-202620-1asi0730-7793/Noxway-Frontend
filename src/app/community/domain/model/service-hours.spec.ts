import { describe, it, expect } from 'vitest';
import { isOpenAt, localTime } from './service-hours';
import { MapPoint } from './service-point.entity';
const service = (opens: string, closes: string) => ({ type: 'pharmacy', timeZone: 'America/Lima', openingHours: [{ opens, closes }] }) as MapPoint;
describe('daily service availability', () => {
  it('uses inclusive opening and exclusive closing boundaries', () => {
    const point = service('08:00', '18:00');
    expect(isOpenAt(point, '07:59')).toBe(false);
    expect(isOpenAt(point, '08:00')).toBe(true);
    expect(isOpenAt(point, '18:00')).toBe(false);
  });
  it('handles overnight intervals and a 24-hour service', () => {
    const point = service('22:00', '06:00');
    expect(isOpenAt(point, '23:59')).toBe(true);
    expect(isOpenAt(point, '00:00')).toBe(true);
    expect(isOpenAt(point, '05:59')).toBe(true);
    expect(isOpenAt(point, '06:00')).toBe(false);
    expect(isOpenAt(point, '12:00')).toBe(false);
    expect(isOpenAt(service('00:00', '24:00'), '23:59')).toBe(true);
  });
  it('keeps unknown hours unconfirmed and risk zones visible', () => {
    expect(isOpenAt({ type: 'pharmacy' } as MapPoint, '12:00')).toBe(false);
    expect(isOpenAt({ type: 'risk_zone' } as MapPoint, '12:00')).toBe(true);
    expect(isOpenAt(service('08:00', '18:00'), '')).toBe(false);
  });
  it('converts UTC to the service timezone', () => {
    expect(localTime(service('00:00', '24:00'), new Date('2026-11-06T03:30:00Z'))).toBe('22:30');
  });
});
