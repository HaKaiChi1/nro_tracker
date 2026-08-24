function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const SERVER_COOKIE = "nro_server";

export const config = {
  dbPath: process.env.NRO_DB_PATH ?? "./data/nro.db",
  server: process.env.NRO_SERVER ?? "Super 1",
  servers: ["Super 1", "Super 3"],
  pageSize: num(process.env.NRO_PAGE_SIZE, 10),
  requestTimeoutMs: num(process.env.NRO_REQUEST_TIMEOUT_MS, 10_000),
  retryCount: num(process.env.NRO_RETRY_COUNT, 3),
  apiUrl: process.env.NRO_API_URL ?? "https://service.dungpham.com.vn/api/thong-bao",
  pageUrl: process.env.NRO_PAGE_URL ?? "https://service.dungpham.com.vn/thong-bao",
  pollSeconds: num(process.env.NRO_POLL_SECONDS, 60),
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
  mail: {
    from: process.env.MAIL_FROM || process.env.SMTP_USER || "",
    to: process.env.MAIL_TO ?? "",
  },
  cleanup: {
    // Người chơi có ngày đầu ghi nhận quá số ngày này VÀ không nằm trong top
    // (topLimit) sẽ bị xoá sạch dữ liệu để database đỡ nặng.
    inactiveDays: num(process.env.NRO_CLEANUP_INACTIVE_DAYS, 37),
    topLimit: num(process.env.NRO_CLEANUP_TOP_LIMIT, 10),
    intervalHours: num(process.env.NRO_CLEANUP_INTERVAL_HOURS, 24),
  },
};
