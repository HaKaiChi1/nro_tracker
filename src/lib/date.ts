// Số ngày kể từ `date` (YYYY-MM-DD) đến hôm nay, tính cả ngày đầu tiên.
export function daysSince(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const first = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(1, Math.floor((today - first) / 86_400_000) + 1);
}
