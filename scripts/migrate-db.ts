import "dotenv/config";
import { queryAll, type NotificationRow } from "../src/lib/db";
import { exportAlertRules, exportPublicData, writeRows } from "../src/lib/data-store";
import { config } from "../src/lib/config";

// Chạy MỘT LẦN để chuyển dữ liệu từ SQLite (data/nro.db) sang NDJSON —
// định dạng mà GitHub Actions dùng làm nơi lưu trữ giữa các lần chạy.

for (const server of config.servers) {
  const rows = queryAll<NotificationRow>(
    `SELECT * FROM notifications WHERE server = ? ORDER BY id ASC`,
    server
  );

  writeRows(server, rows);
  exportPublicData(server, rows);
  console.log(`[migrate] [${server}] đã ghi ${rows.length} bản ghi ra data/ và public/data/`);
}

exportAlertRules();
console.log("[migrate] Xong. Đẩy data/*.ndjson lên nhánh 'data' theo hướng dẫn triển khai.");
