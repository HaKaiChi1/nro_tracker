import "dotenv/config";
import { crawlAll, crawlNew } from "../src/lib/crawler";
import {
  exportAlertRules,
  exportPublicData,
  mergeRows,
  readAlertRules,
  readRows,
  writeRows,
} from "../src/lib/data-store";
import { sendRuleAlertEmail } from "../src/lib/mailer";
import { config } from "../src/lib/config";
import type { NotificationRow } from "../src/lib/types";

// Chạy một lượt: crawl bản ghi mới → gửi mail cảnh báo → ghi NDJSON →
// xuất JSON/CSV tĩnh cho frontend. GitHub Actions gọi script này mỗi ~10 phút;
// khi dev local có thể chạy tay bằng `npm run update`.

async function notifyMatchingRules(server: string, records: NotificationRow[]): Promise<void> {
  const rules = readAlertRules().filter((r) => r.server === server);
  if (rules.length === 0) return;

  for (const record of records) {
    const playerName = (record.player_name ?? "").toLowerCase();
    const matches = rules.filter((r) => r.player_name.toLowerCase() === playerName);

    for (const rule of matches) {
      await sendRuleAlertEmail(rule, record);
    }
  }
}

async function updateServer(server: string): Promise<void> {
  const existing = readRows(server);

  let fresh: NotificationRow[];
  if (existing.length === 0) {
    console.log(`[update] [${server}] chưa có dữ liệu, tải toàn bộ lịch sử...`);
    fresh = await crawlAll((page, total) => console.log(`  [${server}] trang ${page}/${total}`), server);
  } else {
    const latestId = Math.max(...existing.map((r) => r.id));
    fresh = await crawlNew(latestId, undefined, server);
  }

  const merged = mergeRows(existing, fresh);
  const added = merged.length - existing.length;
  console.log(`[update] [${server}] +${added} bản ghi mới (tổng ${merged.length})`);

  writeRows(server, merged);
  exportPublicData(server, merged);

  // Không gửi mail ở lần bootstrap đầu tiên để tránh dội cả lịch sử vào hộp thư.
  if (existing.length > 0 && fresh.length > 0) {
    await notifyMatchingRules(server, fresh);
  }
}

async function main(): Promise<void> {
  for (const server of config.servers) {
    try {
      await updateServer(server);
    } catch (error) {
      // Nguồn dữ liệu sập không được chặn deploy: xuất lại dữ liệu đang có
      // để site vẫn build được, lần cron sau sẽ crawl bù.
      console.error(`[update] [${server}] Lỗi khi crawl (dùng lại dữ liệu cũ):`, error);
      exportPublicData(server, readRows(server));
    }
  }

  exportAlertRules();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
