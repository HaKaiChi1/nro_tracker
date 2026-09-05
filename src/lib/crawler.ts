import { config } from "./config";
import { parseBossResponse, type RawBossNotification } from "./parser";
import type { BossEventRow } from "./db";

type ProgressCallback = (bossName: string, page: number) => void;

const HEADERS = {
  accept: "application/json",
  origin: new URL(config.pageUrl).origin,
  referer: config.pageUrl,
};

// Chặn vòng lặp chạy vô hạn nếu API không bao giờ trả last=true (phòng khi
// backend lại đổi định dạng response như đã từng xảy ra).
const MAX_PAGES_PER_CRAWL = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(page: number, server: string, bossName: string): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(config.pageSize),
    sort: "id,desc",
    server,
    category: config.category,
    bossName,
  });

  return `${config.apiUrl}?${params.toString()}`;
}

function parseApiResponse(text: string): { content: RawBossNotification[]; isLast: boolean } {
  const data = JSON.parse(text);
  const content: RawBossNotification[] = data.content ?? [];

  // API trả về dạng Spring "Slice" (không có totalPages/totalElements), nên
  // phải dựa vào cờ `last` (hoặc trang rỗng) để biết khi nào dừng phân trang.
  return { content, isLast: Boolean(data.last) || content.length === 0 };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPage(
  page: number,
  server: string,
  bossName: string
): Promise<{ records: BossEventRow[]; isLast: boolean }> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.retryCount; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        buildUrl(page, server, bossName),
        {
          method: "GET",
          headers: HEADERS,
        },
        config.requestTimeoutMs
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const { content, isLast } = parseApiResponse(text);

      return { records: parseBossResponse(content), isLast };
    } catch (error) {
      lastError = error;
      await sleep(1000);
    }
  }

  throw lastError;
}

async function crawlAllForBoss(
  bossName: string,
  server: string,
  onProgress?: ProgressCallback
): Promise<BossEventRow[]> {
  let page = 0;
  let isLast = false;
  const all: BossEventRow[] = [];

  while (!isLast && page < MAX_PAGES_PER_CRAWL) {
    const { records, isLast: last } = await fetchPage(page, server, bossName);
    isLast = last;
    all.push(...records);
    onProgress?.(bossName, page + 1);
    page += 1;
  }

  return all;
}

async function crawlNewForBoss(
  bossName: string,
  latestId: number,
  server: string,
  onProgress?: ProgressCallback
): Promise<BossEventRow[]> {
  let page = 0;
  let isLast = false;
  let stop = false;
  const fresh: BossEventRow[] = [];

  while (!isLast && !stop && page < MAX_PAGES_PER_CRAWL) {
    const { records, isLast: last } = await fetchPage(page, server, bossName);
    isLast = last;

    for (const record of records) {
      if (record.id <= latestId) {
        stop = true;
        break;
      }
      fresh.push(record);
    }

    onProgress?.(bossName, page + 1);
    page += 1;
  }

  return fresh;
}

export async function crawlAll(
  onProgress?: ProgressCallback,
  server: string = config.server
): Promise<BossEventRow[]> {
  const all: BossEventRow[] = [];

  for (const bossName of config.bossNames) {
    all.push(...(await crawlAllForBoss(bossName, server, onProgress)));
  }

  return all;
}

export async function crawlNew(
  latestId: number,
  onProgress?: ProgressCallback,
  server: string = config.server
): Promise<BossEventRow[]> {
  const fresh: BossEventRow[] = [];

  for (const bossName of config.bossNames) {
    fresh.push(...(await crawlNewForBoss(bossName, latestId, server, onProgress)));
  }

  return fresh;
}
