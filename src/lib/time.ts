// Human-friendly "time left" until a close date. Returns null when there is no
// close date, and "Closed" once the deadline has passed.
export function timeLeft(closesAt: string | null | undefined): string | null {
  if (!closesAt) return null;
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `Closes in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Closes in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Closes in ${days}d`;
}

export function isClosed(closesAt: string | null | undefined): boolean {
  if (!closesAt) return false;
  return new Date(closesAt).getTime() <= Date.now();
}
