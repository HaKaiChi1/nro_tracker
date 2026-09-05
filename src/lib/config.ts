function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function list(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

// Các boss thuộc "Tiểu Đội Sát Thủ" (Hang khỉ đen): 1 đội trưởng + 4 lính đánh số.
const DEFAULT_BOSS_NAMES = ["Tiểu đội trưởng", "Số 1", "Số 2", "Số 3", "Số 4"];

export const config = {
  dbPath: process.env.NRO_DB_PATH ?? "./data/nro-boss.db",
  server: process.env.NRO_SERVER ?? "Super 1",
  bossNames: list(process.env.NRO_BOSS_NAMES, DEFAULT_BOSS_NAMES),
  category: "BOSS",
  pageSize: num(process.env.NRO_PAGE_SIZE, 10),
  requestTimeoutMs: num(process.env.NRO_REQUEST_TIMEOUT_MS, 10_000),
  retryCount: num(process.env.NRO_RETRY_COUNT, 3),
  apiUrl: process.env.NRO_API_URL ?? "https://service.dungpham.com.vn/api/thong-bao",
  pageUrl: process.env.NRO_PAGE_URL ?? "https://service.dungpham.com.vn/thong-bao",
  pollSeconds: num(process.env.NRO_POLL_SECONDS, 60),
};
