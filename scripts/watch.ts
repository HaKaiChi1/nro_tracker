import "dotenv/config";
import { crawlAll, crawlNew } from "../src/lib/crawler";
import {
  getMeta,
  insertMany,
  latestId,
  listMailRules,
  purgeStalePlayers,
  setMeta,
  totalRecords,
} from "../src/lib/db";
import { sendRuleAlertEmail } from "../src/lib/mailer";
import { config } from "../src/lib/config";

const CLEANUP_META_KEY = "last_cleanup_at";

// Chỉ thực sự dọn dữ liệu rác mỗi `cleanup.intervalHours` giờ, dù được gọi ở
// mỗi tick — tránh quét toàn bộ bảng notifications liên tục.
async function cleanupIfDue(): Promise<void> {
  const last = getMeta(CLEANUP_META_KEY);
  const intervalMs = config.cleanup.intervalHours * 60 * 60 * 1000;
  if (last && Date.now() - new Date(last).getTime() < intervalMs) return;

  for (const server of config.servers) {
    const result = purgeStalePlayers(server);
    if (result.removedPlayers > 0) {
      console.log(
        `[watch] [${server}] dọn dữ liệu rác: xoá ${result.removedPlayers} người chơi ` +
          `(${result.removedRows} bản ghi) không hoạt động quá ${config.cleanup.inactiveDays} ` +
          `ngày và không nằm trong top ${config.cleanup.topLimit}`
      );
    }
  }

  setMeta(CLEANUP_META_KEY, new Date().toISOString());
}

async function notifyMatchingRules(records: Awaited<ReturnType<typeof crawlNew>>): Promise<void> {
  const rules = listMailRules().filter((r) => r.enabled);
  if (rules.length === 0) return;

  for (const record of records) {
    const playerName = (record.player_name ?? "").toLowerCase();
    const matches = rules.filter(
      (r) => r.server === record.server && r.player_name.toLowerCase() === playerName
    );

    for (const rule of matches) {
      await sendRuleAlertEmail(rule, record);
    }
  }
}

async function tick(): Promise<void> {
  for (const server of config.servers) {
    try {
      const records = await crawlNew(latestId(server), undefined, server);
      const inserted = insertMany(records);

      setMeta("last_poll_at", new Date().toISOString());

      if (inserted > 0) {
        console.log(`[watch] [${server}] +${inserted} bản ghi mới (tổng ${totalRecords()})`);
        await notifyMatchingRules(records);
      }
    } catch (error) {
      console.error(`[watch] [${server}] Lỗi khi crawl:`, error);
    }
  }

  try {
    await cleanupIfDue();
  } catch (error) {
    console.error("[watch] Lỗi khi dọn dữ liệu rác:", error);
  }
}

async function bootstrapIfEmpty(): Promise<void> {
  for (const server of config.servers) {
    if (latestId(server) > 0) continue;

    console.log(`[watch] [${server}] chưa có dữ liệu, đang tải toàn bộ lịch sử...`);

    const records = await crawlAll(
      (page, total) => console.log(`  [${server}] trang ${page}/${total}`),
      server
    );
    const inserted = insertMany(records);
    setMeta("last_poll_at", new Date().toISOString());

    console.log(`[watch] [${server}] đã tải ${inserted} bản ghi.`);
  }
}

async function main(): Promise<void> {
  console.log(
    `NRO Track worker — polling mỗi ${config.pollSeconds}s, servers=${config.servers.join(", ")}`
  );

  await bootstrapIfEmpty();
  await tick();

  setInterval(tick, config.pollSeconds * 1000);
}

main().catch((error) => {
  console.error("[watch] Lỗi không xử lý được:", error);
  process.exit(1);
});
