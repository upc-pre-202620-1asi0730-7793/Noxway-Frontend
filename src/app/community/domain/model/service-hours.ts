import { MapPoint } from './service-point.entity';

export function minutesOfDay(value: string): number {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) && value !== '24:00') return NaN;
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

export function isOpenAt(point: MapPoint, time: string): boolean {
  if (point.type === 'risk_zone') return true;
  const minute = minutesOfDay(time);
  if (!Number.isFinite(minute) || minute >= 1440) return false;
  return (point.openingHours ?? []).some(({ opens, closes }) => {
    const start = minutesOfDay(opens), end = minutesOfDay(closes);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start === end) return false;
    return start < end ? minute >= start && minute < end : minute >= start || minute < end;
  });
}

export function localTime(point: MapPoint, now = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: point.timeZone || 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(now);
}
