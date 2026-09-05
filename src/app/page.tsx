import { AutoRefresh } from "@/components/AutoRefresh";
import { AutoUpdateBadge } from "@/components/AutoUpdateBadge";
import { BossFeedPanel } from "@/components/BossFeedPanel";
import { squadFeed, summary } from "@/lib/statistics";

export const dynamic = "force-dynamic";

const FEED_PAGE_SIZE = 10;

function buildFeedHref(page: number): string {
  return page > 1 ? `/?feedPage=${page}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ feedPage?: string }>;
}) {
  const params = await searchParams;
  const feedPage = Math.max(1, Number(params.feedPage) || 1);

  const stats = summary();
  const feed = squadFeed(undefined, feedPage, FEED_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalSeconds={5} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan — Tiểu Đội Sát Thủ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Luồng xuất hiện/hạ boss trực tiếp từ service.dungpham.com.vn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoUpdateBadge lastPollAt={stats.lastPollAt} />
          <a href="/api/export" className="btn-outline">
            ⬇️ Xuất CSV
          </a>
        </div>
      </div>

      <BossFeedPanel
        items={feed.rows}
        total={feed.total}
        page={feedPage}
        pageSize={FEED_PAGE_SIZE}
        buildHref={buildFeedHref}
      />
    </div>
  );
}
