import type { NotificationRow } from "./types";

const PLAYER_PATTERN = /^(\S+)\s+vừa/i;
const SET_PATTERN = /(Set\s+[A-Za-zÀ-ỹ0-9\s]+)/i;

export interface RawNotification {
  id: number;
  time: string;
  server?: string;
  category?: string;
  value?: string;
  killerName?: string;
  bossName?: string;
  equipmentName?: string;
  isKilled?: boolean;
}

export function fixText(text: string | null | undefined): string {
  if (text == null) return "";

  try {
    if (text.includes("Ã") || text.includes("á»") || text.includes("Ä")) {
      return Buffer.from(text, "latin1").toString("utf-8");
    }
  } catch {
    // fall through and return the original text
  }

  return text;
}

export function extractPlayer(value: string): string | null {
  const match = PLAYER_PATTERN.exec(fixText(value));
  return match ? match[1].trim() : null;
}

export function extractItem(value: string): string | null {
  const match = SET_PATTERN.exec(fixText(value));
  return match ? match[1].trim() : null;
}

export function parseNotification(item: RawNotification): NotificationRow {
  const value = fixText(item.value);

  return {
    id: item.id,
    time: item.time,
    server: fixText(item.server),
    category: fixText(item.category),
    value,
    killer_name: fixText(item.killerName),
    boss_name: fixText(item.bossName),
    equipment_name: fixText(item.equipmentName),
    item_name: extractItem(value),
    player_name: extractPlayer(value),
    is_killed: item.isKilled ? 1 : 0,
    crawl_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
}

export function parseResponse(content: RawNotification[]): NotificationRow[] {
  const results: NotificationRow[] = [];

  for (const item of content) {
    try {
      results.push(parseNotification(item));
    } catch {
      continue;
    }
  }

  return results;
}
