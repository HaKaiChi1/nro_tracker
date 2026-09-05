import type { BossEventRow } from "./db";

export interface RawBossNotification {
  id: number;
  time: string;
  server?: string;
  category?: string;
  value?: string;
  killerName?: string;
  bossName?: string;
  equipmentName?: string;
  isKilled?: boolean;
  killedTime?: string;
}

const LOCATION_PATTERN = /tại\s+(.+)$/;

export function extractLocation(value: string): string | null {
  const match = LOCATION_PATTERN.exec(value);
  return match ? match[1].trim() : null;
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

export function parseBossNotification(item: RawBossNotification): BossEventRow {
  const value = fixText(item.value);

  return {
    id: item.id,
    time: item.time,
    server: fixText(item.server),
    boss_name: fixText(item.bossName),
    value,
    location: extractLocation(value),
    killer_name: item.killerName ? fixText(item.killerName) : null,
    equipment_name: item.equipmentName ? fixText(item.equipmentName) : null,
    is_killed: item.isKilled ? 1 : 0,
    killed_time: item.killedTime ?? null,
    crawl_time: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
}

export function parseBossResponse(content: RawBossNotification[]): BossEventRow[] {
  const results: BossEventRow[] = [];

  for (const item of content) {
    try {
      results.push(parseBossNotification(item));
    } catch {
      continue;
    }
  }

  return results;
}
