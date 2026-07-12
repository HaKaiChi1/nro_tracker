import { getMeta, queryAll, queryOne, latestRecord, totalRecords, type NotificationRow } from "./db";
import { config } from "./config";

export interface Summary {
  totalRecords: number;
  latestTime: string;
  latestPlayer: string;
  lastPollAt: string | null;
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

export interface SearchResult {
  rows: Pick<
    NotificationRow,
    "id" | "time" | "player_name" | "item_name" | "category" | "value"
  >[];
  total: number;
}

export const DOW_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function summary(server: string = config.server): Summary {
  const latest = latestRecord(server);

  return {
    totalRecords: totalRecords(server),
    latestTime: latest?.time ?? "-",
    latestPlayer: latest?.player_name ?? "-",
    lastPollAt: getMeta("last_poll_at"),
  };
}

export function topPlayers(
  server: string = config.server,
  limit = 10
): NamedCount[] {
  return queryAll<NamedCount>(
    `
    SELECT player_name AS name, COUNT(*) AS drops
    FROM notifications
    WHERE server = ? AND player_name IS NOT NULL AND player_name <> ''
    GROUP BY player_name
    ORDER BY drops DESC
    LIMIT ?
    `,
    server,
    limit
  );
}

export function topItems(
  server: string = config.server,
  limit = 20
): NamedCount[] {
  return queryAll<NamedCount>(
    `
    SELECT item_name AS name, COUNT(*) AS drops
    FROM notifications
    WHERE server = ? AND item_name IS NOT NULL
    GROUP BY item_name
    ORDER BY drops DESC
    LIMIT ?
    `,
    server,
    limit
  );
}

export function hourlyDistribution(server: string = config.server): HourlyPoint[] {
  const rows = queryAll<{ hour: string; drops: number }>(
    `
    SELECT strftime('%H', time) AS hour, COUNT(*) AS drops
    FROM notifications
    WHERE server = ?
    GROUP BY hour
    `,
    server
  );

  const byHour = new Map(rows.map((r) => [r.hour, r.drops]));

  return Array.from({ length: 24 }, (_, h) => {
    const hh = h.toString().padStart(2, "0");
    return { hour: hh, drops: byHour.get(hh) ?? 0 };
  });
}

// Các ngày gần nhất có dữ liệu (mới nhất trước), dùng cho combobox chọn ngày.
export function recentDates(server: string = config.server, limit = 4): string[] {
  return queryAll<{ date: string }>(
    `
    SELECT DISTINCT substr(time, 1, 10) AS date
    FROM notifications
    WHERE server = ?
    ORDER BY date DESC
    LIMIT ?
    `,
    server,
    limit
  ).map((r) => r.date);
}

export function hourlyDistributionForDate(server: string, date: string): HourlyPoint[] {
  const rows = queryAll<{ hour: string; drops: number }>(
    `
    SELECT strftime('%H', time) AS hour, COUNT(*) AS drops
    FROM notifications
    WHERE server = ? AND substr(time, 1, 10) = ?
    GROUP BY hour
    `,
    server,
    date
  );

  if (rows.length === 0) return [];

  const byHour = new Map(rows.map((r) => [r.hour, r.drops]));

  return Array.from({ length: 24 }, (_, h) => {
    const hh = h.toString().padStart(2, "0");
    return { hour: hh, drops: byHour.get(hh) ?? 0 };
  });
}

export function topPlayersForDate(server: string, date: string, limit = 10): NamedCount[] {
  return queryAll<NamedCount>(
    `
    SELECT player_name AS name, COUNT(*) AS drops
    FROM notifications
    WHERE server = ?
      AND player_name IS NOT NULL AND player_name <> ''
      AND substr(time, 1, 10) = ?
    GROUP BY player_name
    ORDER BY drops DESC
    LIMIT ?
    `,
    server,
    date,
    limit
  );
}

export function dailyDistribution(server: string = config.server): DailyPoint[] {
  return queryAll<DailyPoint>(
    `
    SELECT substr(time, 1, 10) AS date, COUNT(*) AS drops
    FROM notifications
    WHERE server = ?
    GROUP BY date
    ORDER BY date ASC
    `,
    server
  );
}

export interface RecentFeed {
  rows: Pick<NotificationRow, "id" | "time" | "value" | "player_name" | "item_name">[];
  total: number;
}

export function recentNotifications(
  server: string = config.server,
  page = 1,
  pageSize = 10
): RecentFeed {
  const offset = Math.max(page - 1, 0) * pageSize;

  const total = totalRecords(server);

  const rows = queryAll<RecentFeed["rows"][number]>(
    `
    SELECT id, time, value, player_name, item_name
    FROM notifications
    WHERE server = ?
    ORDER BY datetime(time) DESC, id DESC
    LIMIT ? OFFSET ?
    `,
    server,
    pageSize,
    offset
  );

  return { rows, total };
}

export function searchNotifications(
  keyword: string,
  server: string = config.server,
  page = 1,
  pageSize = 25
): SearchResult {
  const like = `%${keyword}%`;
  const offset = Math.max(page - 1, 0) * pageSize;

  const total = queryOne<{ n: number }>(
    `SELECT COUNT(*) AS n FROM notifications WHERE server = ? AND player_name LIKE ?`,
    server,
    like
  )?.n ?? 0;

  const rows = queryAll<SearchResult["rows"][number]>(
    `
    SELECT id, time, player_name, item_name, category, value
    FROM notifications
    WHERE server = ? AND player_name LIKE ?
    ORDER BY datetime(time) DESC
    LIMIT ? OFFSET ?
    `,
    server,
    like,
    pageSize,
    offset
  );

  return { rows, total };
}

export function searchDailyDistribution(
  keyword: string,
  server: string = config.server
): DailyPoint[] {
  const like = `%${keyword}%`;

  return queryAll<DailyPoint>(
    `
    SELECT substr(time, 1, 10) AS date, COUNT(*) AS drops
    FROM notifications
    WHERE server = ? AND player_name LIKE ?
    GROUP BY date
    ORDER BY date ASC
    `,
    server,
    like
  );
}

export interface PlayerSummaryRow {
  name: string;
  drops: number;
  firstDate: string;
  totalDrops: number;
}

export function playersForDate(
  server: string = config.server,
  date: string
): PlayerSummaryRow[] {
  return queryAll<PlayerSummaryRow>(
    `
    SELECT
      n.player_name AS name,
      COUNT(*) AS drops,
      (
        SELECT MIN(substr(f.time, 1, 10))
        FROM notifications f
        WHERE f.server = n.server AND f.player_name = n.player_name
      ) AS firstDate,
      (
        SELECT COUNT(*)
        FROM notifications f
        WHERE f.server = n.server AND f.player_name = n.player_name
      ) AS totalDrops
    FROM notifications n
    WHERE n.server = ?
      AND n.player_name IS NOT NULL AND n.player_name <> ''
      AND substr(n.time, 1, 10) = ?
    GROUP BY n.player_name
    ORDER BY drops DESC
    `,
    server,
    date
  );
}

export function playerTimeline(
  playerName: string,
  server: string = config.server
): NotificationRow[] {
  return queryAll<NotificationRow>(
    `
    SELECT *
    FROM notifications
    WHERE server = ? AND player_name = ?
    ORDER BY datetime(time) ASC
    `,
    server,
    playerName
  );
}

export function allRowsForExport(server: string = config.server): NotificationRow[] {
  return queryAll<NotificationRow>(
    `
    SELECT *
    FROM notifications
    WHERE server = ?
    ORDER BY datetime(time) DESC
    `,
    server
  );
}
