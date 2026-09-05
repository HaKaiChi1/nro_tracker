import type { LocationHistoryEntry } from "./statistics";

function escapeCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// "YYYY-MM-DD HH:MM:SS" -> "DD/MM/YYYY HH:MM:SS"
function formatCsvTime(time: string): string {
  const [datePart, timePart] = time.split(" ");
  const [y, m, d] = (datePart ?? "").split("-");
  return `${d}/${m}/${y} ${timePart ?? ""}`;
}

export function locationHistoryToCsv(rows: LocationHistoryEntry[]): string {
  const header = "STT,Thời gian,Địa điểm";
  const lines = rows.map(
    (row) => `${row.stt},${escapeCell(formatCsvTime(row.time))},${escapeCell(row.location)}`
  );
  return ["﻿" + header, ...lines].join("\n");
}
