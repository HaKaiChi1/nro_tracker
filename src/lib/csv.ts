import type { NotificationRow } from "./db";

const COLUMNS: (keyof NotificationRow)[] = [
  "id",
  "time",
  "server",
  "category",
  "value",
  "player_name",
  "killer_name",
  "boss_name",
  "equipment_name",
  "item_name",
  "is_killed",
  "crawl_time",
];

function escapeCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(rows: NotificationRow[]): string {
  const header = COLUMNS.join(",");
  const lines = rows.map((row) => COLUMNS.map((col) => escapeCell(row[col])).join(","));
  return ["﻿" + header, ...lines].join("\n");
}
