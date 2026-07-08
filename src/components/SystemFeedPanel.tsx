import Link from "next/link";
import type { RecentFeed } from "@/lib/statistics";
import { buildPageWindow } from "@/lib/pagination";
import { formatDateVi, timeAgoVi } from "@/lib/time";

function SystemCard({ item }: { item: RecentFeed["rows"][number] }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <p className="font-medium">{item.value}</p>
      <p className="text-xs text-slate-400">
        {formatDateVi(item.time)} · {timeAgoVi(item.time)}
      </p>
    </div>
  );
}

export function SystemFeedPanel({
  items,
  total,
  page,
  pageSize,
  buildHref,
}: {
  items: RecentFeed["rows"];
  total: number;
  page: number;
  pageSize: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageWindow = buildPageWindow(page, totalPages);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Thông báo Hệ thống</h2>
        <span className="text-xs text-slate-400">Toàn bộ lịch sử đã thu thập</span>
      </div>

      <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
        {items.map((item) => (
          <SystemCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-400">Chưa có dữ liệu.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm">
          <span className="mr-3 text-xs text-slate-400">
            Tổng cộng {total.toLocaleString("vi-VN")} bản ghi
          </span>

          <Link
            href={buildHref(Math.max(1, page - 1))}
            className={`btn-outline px-2 py-1 ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ‹
          </Link>

          {pageWindow.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref(p)}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  p === page
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {p}
              </Link>
            )
          )}

          <Link
            href={buildHref(Math.min(totalPages, page + 1))}
            className={`btn-outline px-2 py-1 ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            ›
          </Link>
        </div>
      )}
    </div>
  );
}
