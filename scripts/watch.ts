import "dotenv/config";
import { crawlAll, crawlNew } from "../src/lib/crawler";
import { insertMany, latestId, setMeta, totalRecords } from "../src/lib/db";
import { config } from "../src/lib/config";

async function tick(): Promise<void> {
  try {
    const records = await crawlNew(latestId());
    const inserted = insertMany(records);

    setMeta("last_poll_at", new Date().toISOString());

    if (inserted > 0) {
      console.log(`[watch] +${inserted} bản ghi mới (tổng ${totalRecords()})`);
    }
  } catch (error) {
    console.error("[watch] Lỗi khi crawl:", error);
  }
}

async function bootstrapIfEmpty(): Promise<void> {
  if (latestId() > 0) return;

  console.log("[watch] chưa có dữ liệu, đang tải toàn bộ lịch sử...");

  const records = await crawlAll((bossName, page) => console.log(`  [${bossName}] trang ${page}`));
  const inserted = insertMany(records);
  setMeta("last_poll_at", new Date().toISOString());

  console.log(`[watch] đã tải ${inserted} bản ghi.`);
}

async function main(): Promise<void> {
  console.log(
    `NRO Track Boss worker — polling mỗi ${config.pollSeconds}s, server=${config.server}, boss=${config.bossNames.join(", ")}`
  );

  await bootstrapIfEmpty();
  await tick();

  setInterval(tick, config.pollSeconds * 1000);
}

main().catch((error) => {
  console.error("[watch] Lỗi không xử lý được:", error);
  process.exit(1);
});
