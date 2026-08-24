import { config } from "./config";
import { parseResponse, type RawNotification } from "./parser";
import type { NotificationRow } from "./db";

type ProgressCallback = (page: number, totalPages: number) => void;

const HEADERS = {
  accept: "application/json",
  origin: new URL(config.pageUrl).origin,
  referer: config.pageUrl,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(page: number, server: string): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(config.pageSize),
    sort: "id,desc",
    server,
    category: "SYSTEM",
  });

  return `${config.apiUrl}?${params.toString()}`;
}

function parseApiResponse(text: string): { content: RawNotification[]; totalPages: number } {
  const data = JSON.parse(text);

  return { content: data.content, totalPages: data.totalPages };
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
  server: string = config.server
): Promise<{ records: NotificationRow[]; totalPages: number }> {
  let lastError: unknown;

  for (let attempt = 0; attempt < config.retryCount; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        buildUrl(page, server),
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
      const { content, totalPages } = parseApiResponse(text);

      return { records: parseResponse(content), totalPages };
    } catch (error) {
      lastError = error;
      await sleep(1000);
    }
  }

  throw lastError;
}

export async function crawlAll(
  onProgress?: ProgressCallback,
  server: string = config.server
): Promise<NotificationRow[]> {
  let page = 0;
  let totalPages = 1;
  const all: NotificationRow[] = [];

  while (page < totalPages) {
    const { records, totalPages: tp } = await fetchPage(page, server);
    totalPages = tp;
    all.push(...records);
    onProgress?.(page + 1, totalPages);
    page += 1;
  }

  return all;
}

export async function crawlNew(
  latestId: number,
  onProgress?: ProgressCallback,
  server: string = config.server
): Promise<NotificationRow[]> {
  let page = 0;
  let totalPages = 1;
  const fresh: NotificationRow[] = [];
  let stop = false;

  while (page < totalPages && !stop) {
    const { records, totalPages: tp } = await fetchPage(page, server);
    totalPages = tp;

    for (const record of records) {
      if (record.id <= latestId) {
        stop = true;
        break;
      }
      fresh.push(record);
    }

    onProgress?.(page + 1, totalPages);
    page += 1;
  }

  return fresh;
}
