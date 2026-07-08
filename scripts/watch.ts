import "dotenv/config";
import { crawlAll, crawlNew } from "../src/lib/crawler";
import { insertMany, latestId, listMailRules, setMeta, totalRecords } from "../src/lib/db";
import { sendRuleAlertEmail } from "../src/lib/mailer";
import { config } from "../src/lib/config";

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
