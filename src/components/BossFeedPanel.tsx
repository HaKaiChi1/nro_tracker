import Link from "next/link";
import { SQUAD_MEMBERS, SQUAD_LABELS, type SquadGroup } from "@/lib/statistics";
import { buildPageWindow } from "@/lib/pagination";
import { formatDateVi, timeAgoVi } from "@/lib/time";

function SquadCard({ item }: { item: SquadGroup }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          Tiểu Đội Sát Thủ vừa xuất hiện tại{" "}
          <span className="text-indigo-600 dark:text-indigo-400">{item.location ?? "?"}</span>
        </p>
        <div className="flex shrink-0 gap-1">
          {SQUAD_MEMBERS.map((name) => (
            <span key={name} className={item.appeared[name] ? "boss-pip-on" : "boss-pip-off"}>
              {SQUAD_LABELS[name]}
            </span>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        {formatDateVi(item.time)} · {timeAgoVi(item.time)}
      </p>
    </div>
  );
}

export function BossFeedPanel({
  items,
  total,
  page,
  pageSize,
  buildHref,
}: {
  items: SquadGroup[];
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
        <h2 className="text-lg font-bold">Tiểu Đội Sát Thủ</h2>
        <span className="text-xs text-slate-400">Toàn bộ lịch sử đã thu thập</span>
      </div>

      <div className="card divide-y divide-slate-100 p-0 dark:divide-slate-800">
        {items.map((item) => (
          <SquadCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-400">Chưa có dữ liệu.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm">
          <span className="mr-3 text-xs text-slate-400">
            Tổng cộng {total.toLocaleString("vi-VN")} đợt xuất hiện
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
