import { config } from "./config";
import { parseResponse, type RawNotification } from "./parser";
import type { NotificationRow } from "./types";

type ProgressCallback = (page: number, totalPages: number) => void;

const HEADERS = {
  accept: "text/x-component",
  "content-type": "text/plain;charset=UTF-8",
  "next-action": config.nextAction,
  origin: new URL(config.baseUrl).origin,
  referer: config.baseUrl,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPayload(page: number, server: string) {
  return [
    {
      page,
      size: config.pageSize,
      sort: "id,desc",
      server,
      category: "SYSTEM",
      bossName: null,
      bossNames: null,
      equipmentName: null,
      locationFilter: null,
    },
  ];
}

function parseServerAction(text: string): { content: RawNotification[]; totalPages: number } {
  const match = /1:(\{[\s\S]*\})$/.exec(text.trim());

  if (!match) {
    throw new Error("Cannot parse server response.");
  }

  const data = JSON.parse(match[1]);

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
        config.baseUrl,
        {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(buildPayload(page, server)),
        },
        config.requestTimeoutMs
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const { content, totalPages } = parseServerAction(text);

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
