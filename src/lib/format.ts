export function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const total = Math.round(seconds);
  if (total < 60) return `${total}秒`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}分${total % 60 > 0 ? `${total % 60}秒` : ""}`;
  return `${Math.floor(minutes / 60)}時間${minutes % 60}分`;
}
