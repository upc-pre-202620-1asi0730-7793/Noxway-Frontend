/** Local date/time pairs keep the original date when rest crosses midnight. */
export function restPeriod(startText: string, endText: string): { start: Date; end: Date; minutes: number } | null {
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!pattern.test(startText) || !pattern.test(endText)) return null;
  const start = new Date(startText), end = new Date(endText);
  const matches = (date: Date, text: string) => {
    if (!Number.isFinite(date.getTime())) return false;
    const [year, month, day, hour, minute] = text.split(/[-T:]/).map(Number);
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day && date.getHours() === hour && date.getMinutes() === minute;
  };
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  return matches(start, startText) && matches(end, endText) && minutes > 0 && minutes <= 1440
    ? { start, end, minutes } : null;
}
