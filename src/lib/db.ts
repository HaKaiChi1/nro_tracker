import path from "node:path";
import fs from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { config } from "./config";

export interface BossEventRow {
  id: number;
  time: string;
  server: string;
  boss_name: string;
  value: string | null;
  location: string | null;
  killer_name: string | null;
  equipment_name: string | null;
  is_killed: number;
  killed_time: string | null;
  crawl_time: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __nroBossDb: DatabaseSync | undefined;
}

function createConnection(): DatabaseSync {
  const dbPath = path.resolve(process.cwd(), config.dbPath);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS boss_events
    (
        id INTEGER PRIMARY KEY,

        time TEXT NOT NULL,
        server TEXT NOT NULL,
        boss_name TEXT NOT NULL,

        value TEXT,
        location TEXT,

        killer_name TEXT,
        equipment_name TEXT,

        is_killed INTEGER,
        killed_time TEXT,

        crawl_time TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_server ON boss_events(server);
    CREATE INDEX IF NOT EXISTS idx_time ON boss_events(time);
    CREATE INDEX IF NOT EXISTS idx_boss_name ON boss_events(boss_name);

    CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
    );
  `);

  // Web dungpham đôi khi phát cùng một thông báo nhiều lần với id khác nhau
  // (cùng server + time + value). Dọn các bản ghi trùng còn sót lại từ trước,
  // rồi thêm ràng buộc UNIQUE để INSERT OR IGNORE tự chặn trùng lặp mới.
  db.exec(`
    DELETE FROM boss_events
    WHERE id NOT IN (
      SELECT MIN(id) FROM boss_events GROUP BY server, time, value
    )
  `);
  db.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_dedup ON boss_events(server, time, value)`
  );

  ensureColumn(db, "boss_events", "location", "TEXT");

  // Backfill khu vực xuất hiện cho các bản ghi cũ (trước khi có cột location),
  // tách từ text sau "tại " trong value, vd "... vừa xuất hiện tại Hang khỉ đen".
  db.exec(`
    UPDATE boss_events
    SET location = TRIM(SUBSTR(value, INSTR(value, 'tại ') + 4))
    WHERE location IS NULL AND INSTR(value, 'tại ') > 0
  `);

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
  if (!global.__nroBossDb) {
    global.__nroBossDb = createConnection();
  }
  return global.__nroBossDb;
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
  INSERT OR IGNORE INTO boss_events
  (id, time, server, boss_name, value, location, killer_name, equipment_name, is_killed, killed_time, crawl_time)
  VALUES
  (@id, @time, @server, @boss_name, @value, @location, @killer_name, @equipment_name, @is_killed, @killed_time, @crawl_time)
`;

export function insertMany(records: BossEventRow[]): number {
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
    ? queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM boss_events WHERE server = ?`, server)
    : queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM boss_events`);
  return Number(row?.n ?? 0);
}

export function latestId(server?: string): number {
  const row = server
    ? queryOne<{ id: number }>(
        `SELECT COALESCE(MAX(id), 0) AS id FROM boss_events WHERE server = ?`,
        server
      )
    : queryOne<{ id: number }>(`SELECT COALESCE(MAX(id), 0) AS id FROM boss_events`);
  return Number(row?.id ?? 0);
}

export function latestRecord(server?: string): BossEventRow | null {
  return server
    ? queryOne<BossEventRow>(
        `SELECT * FROM boss_events WHERE server = ? ORDER BY id DESC LIMIT 1`,
        server
      )
    : queryOne<BossEventRow>(`SELECT * FROM boss_events ORDER BY id DESC LIMIT 1`);
}

export function getMeta(key: string): string | null {
  return queryOne<{ value: string }>(`SELECT value FROM meta WHERE key = ?`, key)?.value ?? null;
}

export function setMeta(key: string, value: string): void {
  getDb()
    .prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`)
    .run(key, value);
}
