import fs from "node:fs";
import path from "node:path";
import { toCsv } from "./csv";
import { serverSlug, type AlertRule, type NotificationRow, type ServerDataFile } from "./types";

// Lưu trữ dạng NDJSON (mỗi dòng một bản ghi) trong data/<slug>.ndjson.
// Trên CI, thư mục data/ được khôi phục từ nhánh `data` trước khi chạy
// và đẩy ngược lại sau khi cập nhật — đây là "database" thay cho SQLite.

const DATA_DIR = path.resolve(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.resolve(process.cwd(), "public", "data");

function ndjsonPath(server: string): string {
  return path.join(DATA_DIR, `${serverSlug(server)}.ndjson`);
}

export function readRows(server: string): NotificationRow[] {
  const file = ndjsonPath(server);
  if (!fs.existsSync(file)) return [];

  return fs
    .readFileSync(file, "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line) as NotificationRow);
}

export function writeRows(server: string, rows: NotificationRow[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const sorted = [...rows].sort((a, b) => a.id - b.id);
  const body = sorted.map((row) => JSON.stringify(row)).join("\n");
  fs.writeFileSync(ndjsonPath(server), body + "\n");
}

export function mergeRows(existing: NotificationRow[], fresh: NotificationRow[]): NotificationRow[] {
  const byId = new Map<number, NotificationRow>();
  for (const row of existing) byId.set(row.id, row);
  for (const row of fresh) byId.set(row.id, row);
  return Array.from(byId.values());
}

function sortNewestFirst(rows: NotificationRow[]): NotificationRow[] {
  return [...rows].sort((a, b) => {
    if (a.time !== b.time) return a.time < b.time ? 1 : -1;
    return b.id - a.id;
  });
}

// Sinh file tĩnh cho frontend: public/data/<slug>.json và <slug>.csv
export function exportPublicData(server: string, rows: NotificationRow[]): void {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  const slug = serverSlug(server);
  const sorted = sortNewestFirst(rows);

  const payload: ServerDataFile = {
    server,
    generated_at: new Date().toISOString(),
    rows: sorted,
  };

  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, `${slug}.json`), JSON.stringify(payload));
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, `${slug}.csv`), toCsv(sorted));
}

export function readAlertRules(): AlertRule[] {
  const file = path.resolve(process.cwd(), "alerts.json");
  if (!fs.existsSync(file)) return [];

  const rules = JSON.parse(fs.readFileSync(file, "utf-8")) as AlertRule[];
  return rules.filter((r) => r.enabled !== false);
}

// Copy alerts.json vào public/data để trang Cảnh báo hiển thị luật hiện có.
export function exportAlertRules(): void {
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  const file = path.resolve(process.cwd(), "alerts.json");
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "[]";
  fs.writeFileSync(path.join(PUBLIC_DATA_DIR, "alerts.json"), content);
}
