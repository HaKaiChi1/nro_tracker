export interface NotificationRow {
  id: number;
  time: string;
  server: string;
  category: string | null;
  value: string | null;
  player_name: string | null;
  killer_name: string | null;
  boss_name: string | null;
  equipment_name: string | null;
  item_name: string | null;
  is_killed: number;
  crawl_time: string;
}

// Một luật cảnh báo email, khai báo trong file alerts.json ở gốc repo.
export interface AlertRule {
  player_name: string;
  server: string;
  mail_to: string;
  subject?: string | null;
  enabled?: boolean;
}

// Payload tĩnh mỗi server, sinh bởi scripts/update.ts vào public/data/<slug>.json
export interface ServerDataFile {
  server: string;
  generated_at: string;
  rows: NotificationRow[];
}

export function serverSlug(server: string): string {
  return server.toLowerCase().replace(/\s+/g, "-");
}
