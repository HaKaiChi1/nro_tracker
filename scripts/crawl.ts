import "dotenv/config";
import { crawlAll, crawlNew } from "../src/lib/crawler";
import { insertMany, latestId, totalRecords } from "../src/lib/db";

async function main() {
  const full = process.argv.includes("--full");
  const start = latestId();

  console.log(full ? "Crawling toàn bộ lịch sử..." : `Crawling bản ghi mới sau id=${start}...`);

  const records = full
    ? await crawlAll((page) => console.log(`  trang ${page}`))
    : await crawlNew(start, (page) => console.log(`  trang ${page}`));

  const inserted = insertMany(records);

  console.log(`Đã thêm ${inserted} bản ghi mới. Tổng số hiện tại: ${totalRecords()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
