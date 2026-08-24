import path from "node:path";
import fs from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { config } from "./config";
import { daysSince } from "./date";

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

declare global {
  // eslint-disable-next-line no-var
  var __nroDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const dbPath = path.resolve(process.cwd(), config.dbPath);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications
    (
        id INTEGER PRIMARY KEY,

        time TEXT NOT NULL,
        server TEXT NOT NULL,
        category TEXT,

        value TEXT,

        player_name TEXT,
        killer_name TEXT,
        boss_name TEXT,
        equipment_name TEXT,

        item_name TEXT,

        is_killed INTEGER,

        crawl_time TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_server ON notifications(server);
    CREATE INDEX IF NOT EXISTS idx_time ON notifications(time);
    CREATE INDEX IF NOT EXISTS idx_player ON notifications(player_name);
    CREATE INDEX IF NOT EXISTS idx_item ON notifications(item_name);

    CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
    );

    CREATE TABLE IF NOT EXISTS mail_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        subject TEXT,
        mail_to TEXT,
        server TEXT NOT NULL DEFAULT 'Super 1',
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
    );
  `);

  // Migration safety net for databases created before mail_to/enabled/server existed.
  ensureColumn(db, "mail_rules", "mail_to", "TEXT");
  ensureColumn(db, "mail_rules", "enabled", "INTEGER NOT NULL DEFAULT 1");
  ensureColumn(db, "mail_rules", "server", "TEXT NOT NULL DEFAULT 'Super 1'");

  return db;
}

function ensureColumn(db: DatabaseSync, table: string, column: string, definition: string): void {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// Reused across hot-reloads in dev so we don't leak connections / re-run WAL setup.
export function getDb(): DatabaseSync {
  if (!global.__nroDb) {
    global.__nroDb = createConnection();
  }
  return global.__nroDb;
}

// node:sqlite returns rows as null-prototype objects, which React Server
// Components refuse to pass to Client Components ("classes or null
// prototypes are not supported"). Spreading into a literal fixes that.
function plain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function queryAll<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return getDb()
    .prepare(sql)
    .all(...params)
    .map((row) => plain<T>(row));
}

export function queryOne<T>(sql: string, ...params: SQLInputValue[]): T | null {
  const row = getDb().prepare(sql).get(...params);
  return row ? plain<T>(row) : null;
}

const insertSql = `
  INSERT OR IGNORE INTO notifications
  (id, time, server, category, value, player_name, killer_name, boss_name, equipment_name, item_name, is_killed, crawl_time)
  VALUES
  (@id, @time, @server, @category, @value, @player_name, @killer_name, @boss_name, @equipment_name, @item_name, @is_killed, @crawl_time)
`;

export function insertMany(records: NotificationRow[]): number {
  if (records.length === 0) return 0;

  const db = getDb();
  const stmt = db.prepare(insertSql);
  let inserted = 0;

  db.exec("BEGIN");
  try {
    for (const row of records) {
      const result = stmt.run(row as unknown as Record<string, SQLInputValue>);
      if (Number(result.changes) > 0) inserted += 1;
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return inserted;
}

export function totalRecords(server?: string): number {
  const row = server
    ? queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM notifications WHERE server = ?`, server)
    : queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM notifications`);
  return Number(row?.n ?? 0);
}

export function latestId(server?: string): number {
  const row = server
    ? queryOne<{ id: number }>(
        `SELECT COALESCE(MAX(id), 0) AS id FROM notifications WHERE server = ?`,
        server
      )
    : queryOne<{ id: number }>(`SELECT COALESCE(MAX(id), 0) AS id FROM notifications`);
  return Number(row?.id ?? 0);
}

export function latestRecord(server?: string): NotificationRow | null {
  return server
    ? queryOne<NotificationRow>(
        `SELECT * FROM notifications WHERE server = ? ORDER BY id DESC LIMIT 1`,
        server
      )
    : queryOne<NotificationRow>(`SELECT * FROM notifications ORDER BY id DESC LIMIT 1`);
}

export function getMeta(key: string): string | null {
  return queryOne<{ value: string }>(`SELECT value FROM meta WHERE key = ?`, key)?.value ?? null;
}

export function setMeta(key: string, value: string): void {
  getDb()
    .prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`)
    .run(key, value);
}

export interface MailRule {
  id: number;
  player_name: string;
  subject: string | null;
  mail_to: string | null;
  server: string;
  enabled: number;
  created_at: string;
}

export function listMailRules(server?: string): MailRule[] {
  return server
    ? queryAll<MailRule>(`SELECT * FROM mail_rules WHERE server = ? ORDER BY id DESC`, server)
    : queryAll<MailRule>(`SELECT * FROM mail_rules ORDER BY id DESC`);
}

export function addMailRule(
  playerName: string,
  subject: string | null,
  mailTo: string,
  server: string
): void {
  getDb()
    .prepare(
      `INSERT INTO mail_rules (player_name, subject, mail_to, server, enabled, created_at) VALUES (?, ?, ?, ?, 1, ?)`
    )
    .run(playerName.trim(), subject?.trim() || null, mailTo.trim(), server, new Date().toISOString());
}

export function deleteMailRule(id: number): void {
  getDb().prepare(`DELETE FROM mail_rules WHERE id = ?`).run(id);
}

export function toggleMailRule(id: number): void {
  getDb().prepare(`UPDATE mail_rules SET enabled = 1 - enabled WHERE id = ?`).run(id);
}

export interface CleanupResult {
  server: string;
  removedPlayers: number;
  removedRows: number;
}

// Xoá sạch dữ liệu của những người chơi đã xuất hiện quá `inactiveDays` ngày
// (tính từ bản ghi đầu tiên) mà hiện không còn nằm trong top `topLimit` người
// nhặt được nhiều đồ nhất — tức là dữ liệu không còn được hiển thị ở đâu, chỉ
// làm nặng database.
export function purgeStalePlayers(
  server: string,
  inactiveDays: number = config.cleanup.inactiveDays,
  topLimit: number = config.cleanup.topLimit
): CleanupResult {
  const db = getDb();

  const topNames = new Set(
    (
      db
        .prepare(
          `
          SELECT player_name
          FROM notifications
          WHERE server = ? AND player_name IS NOT NULL AND player_name <> ''
          GROUP BY player_name
          ORDER BY COUNT(*) DESC
          LIMIT ?
          `
        )
        .all(server, topLimit) as { player_name: string }[]
    ).map((r) => r.player_name)
  );

  const candidates = db
    .prepare(
      `
      SELECT player_name, MIN(substr(time, 1, 10)) AS firstDate
      FROM notifications
      WHERE server = ? AND player_name IS NOT NULL AND player_name <> ''
      GROUP BY player_name
      `
    )
    .all(server) as { player_name: string; firstDate: string }[];

  const staleNames = candidates
    .filter((c) => !topNames.has(c.player_name) && daysSince(c.firstDate) > inactiveDays)
    .map((c) => c.player_name);

  if (staleNames.length === 0) {
    return { server, removedPlayers: 0, removedRows: 0 };
  }

  const placeholders = staleNames.map(() => "?").join(", ");
  let removedRows = 0;

  db.exec("BEGIN");
  try {
    const result = db
      .prepare(`DELETE FROM notifications WHERE server = ? AND player_name IN (${placeholders})`)
      .run(server, ...staleNames);
    removedRows = Number(result.changes);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return { server, removedPlayers: staleNames.length, removedRows };
}
