"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AutoUpdateBadge } from "@/components/AutoUpdateBadge";
import { SystemFeedPanel } from "@/components/SystemFeedPanel";
import { paginate, sortNewestFirst } from "@/lib/stats-client";
import { useServerData } from "@/lib/use-server-data";

const FEED_PAGE_SIZE = 10;

function buildFeedHref(page: number): string {
  return page > 1 ? `/?feedPage=${page}` : "/";
}

function HomeContent() {
  const searchParams = useSearchParams();
  const feedPage = Math.max(1, Number(searchParams.get("feedPage")) || 1);

  const { server, rows, generatedAt, loading } = useServerData();
  const sorted = sortNewestFirst(rows);
  const feedRows = paginate(sorted, feedPage, FEED_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Tổng quan — {server}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Luồng thông báo thu thập từ service.dungpham.com.vn
          </p>
        </div>
        <AutoUpdateBadge lastPollAt={generatedAt} />
      </div>

      {loading && rows.length === 0 ? (
        <div className="card px-4 py-8 text-center text-slate-400">Đang tải dữ liệu...</div>
      ) : (
        <SystemFeedPanel
          items={feedRows}
          total={sorted.length}
          page={feedPage}
          pageSize={FEED_PAGE_SIZE}
          buildHref={buildFeedHref}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
