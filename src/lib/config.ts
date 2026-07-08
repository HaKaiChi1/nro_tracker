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
  baseUrl: process.env.NRO_BASE_URL ?? "https://service.dungpham.com.vn/thong-bao",
  nextAction:
    process.env.NRO_NEXT_ACTION ?? "408aadffb9130a58e96f7d7f9333bc65c5c27ac0ce",
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
};
