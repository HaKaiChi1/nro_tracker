import type { NotificationRow } from "./types";

// Bản thuần JS của src/lib/statistics.ts cũ (trước đây chạy SQL trên server).
// Toàn bộ thống kê giờ tính trực tiếp trên mảng rows tải từ JSON tĩnh.
// Quy ước: rows đã được sắp xếp mới nhất trước (time DESC, id DESC).

export interface Summary {
  totalRecords: number;
  latestTime: string;
  latestPlayer: string;
}

export interface NamedCount {
  name: string;
  drops: number;
}

export interface HourlyPoint {
  hour: string;
  drops: number;
}

export interface DailyPoint {
  date: string;
  drops: number;
}

export interface HeatmapCell {
  dow: number; // 0 = Sunday ... 6 = Saturday
  hour: number; // 0-23
  drops: number;
}

export const DOW_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function sortNewestFirst(rows: NotificationRow[]): NotificationRow[] {
  return [...rows].sort((a, b) => {
    if (a.time !== b.time) return a.time < b.time ? 1 : -1;
    return b.id - a.id;
  });
}

export function summary(rows: NotificationRow[]): Summary {
  const latest = rows[0];
  return {
    totalRecords: rows.length,
    latestTime: latest?.time ?? "-",
    latestPlayer: latest?.player_name ?? "-",
  };
}

function countBy(
  rows: NotificationRow[],
  key: (row: NotificationRow) => string | null | undefined
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

function topOf(counts: Map<string, number>, limit: number): NamedCount[] {
  return Array.from(counts, ([name, drops]) => ({ name, drops }))
    .sort((a, b) => b.drops - a.drops)
    .slice(0, limit);
}

export function topPlayers(rows: NotificationRow[], limit = 10): NamedCount[] {
  return topOf(countBy(rows, (r) => r.player_name), limit);
}

export function topItems(rows: NotificationRow[], limit = 20): NamedCount[] {
  return topOf(countBy(rows, (r) => r.item_name), limit);
}

function hourOf(time: string): string {
  return time.slice(11, 13);
}

function dateOf(time: string): string {
  return time.slice(0, 10);
}

function fillHours(byHour: Map<string, number>): HourlyPoint[] {
  return Array.from({ length: 24 }, (_, h) => {
    const hh = h.toString().padStart(2, "0");
    return { hour: hh, drops: byHour.get(hh) ?? 0 };
  });
}

export function hourlyDistribution(rows: NotificationRow[]): HourlyPoint[] {
  return fillHours(countBy(rows, (r) => hourOf(r.time)));
}

// Các ngày gần nhất có dữ liệu (mới nhất trước), dùng cho combobox chọn ngày.
export function recentDates(rows: NotificationRow[], limit = 4): string[] {
  const dates = new Set<string>();
  for (const row of rows) dates.add(dateOf(row.time));
  return Array.from(dates).sort().reverse().slice(0, limit);
}

export function hourlyDistributionForDate(rows: NotificationRow[], date: string): HourlyPoint[] {
  const filtered = rows.filter((r) => dateOf(r.time) === date);
  if (filtered.length === 0) return [];
  return fillHours(countBy(filtered, (r) => hourOf(r.time)));
}

export function topPlayersForDate(rows: NotificationRow[], date: string, limit = 10): NamedCount[] {
  return topPlayers(rows.filter((r) => dateOf(r.time) === date), limit);
}

export function dailyDistribution(rows: NotificationRow[]): DailyPoint[] {
  const counts = countBy(rows, (r) => dateOf(r.time));
  return Array.from(counts, ([date, drops]) => ({ date, drops })).sort((a, b) =>
    a.date < b.date ? -1 : 1
  );
}

export function heatmap(rows: NotificationRow[]): HeatmapCell[] {
  const byKey = new Map<string, number>();
  for (const row of rows) {
    // strftime('%w') cũ: 0 = Chủ nhật. new Date().getDay() cho kết quả tương tự.
    const d = new Date(row.time.replace(" ", "T"));
    const key = `${d.getDay()}-${d.getHours()}`;
    byKey.set(key, (byKey.get(key) ?? 0) + 1);
  }

  const cells: HeatmapCell[] = [];
  for (let dow = 0; dow < 7; dow += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      cells.push({ dow, hour, drops: byKey.get(`${dow}-${hour}`) ?? 0 });
    }
  }
  return cells;
}

export function searchNotifications(rows: NotificationRow[], keyword: string): NotificationRow[] {
  const needle = keyword.toLowerCase();
  return rows.filter((r) => (r.player_name ?? "").toLowerCase().includes(needle));
}

export function searchDailyDistribution(rows: NotificationRow[], keyword: string): DailyPoint[] {
  return dailyDistribution(searchNotifications(rows, keyword));
}

export function playerTimeline(rows: NotificationRow[], playerName: string): NotificationRow[] {
  // Trả về cũ → mới, giống ORDER BY datetime(time) ASC trước đây.
  return rows.filter((r) => r.player_name === playerName).reverse();
}

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const offset = Math.max(page - 1, 0) * pageSize;
  return rows.slice(offset, offset + pageSize);
}
