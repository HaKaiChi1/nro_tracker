"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { playerTimeline, sortNewestFirst } from "@/lib/stats-client";
import { useServerData } from "@/lib/use-server-data";

function PlayerContent() {
  const searchParams = useSearchParams();
  const playerName = (searchParams.get("name") ?? "").trim();

  const { rows: rawRows, loading } = useServerData();
  const rows = playerTimeline(sortNewestFirst(rawRows), playerName);

  if (!playerName || (rows.length === 0 && !loading)) {
    return (
      <div className="card px-4 py-8 text-center text-slate-400">
        Không tìm thấy dữ liệu cho người chơi này.{" "}
        <Link href="/search" className="underline">
          Quay lại trang Tìm kiếm
        </Link>
        .
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className="card px-4 py-8 text-center text-slate-400">Đang tải dữ liệu...</div>;
  }

  const timeline = [...rows].reverse().slice(0, 200);
  const first = rows[0];
  const last = rows[rows.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{playerName}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {rows.length.toLocaleString("vi-VN")} lượt drop · lần đầu ghi nhận {first.time} · gần nhất{" "}
          {last.time}
        </p>
      </div>

      <div className="card overflow-hidden p-0">
        <ol className="divide-y divide-slate-100 dark:divide-slate-800">
          {timeline.map((row) => (
            <li key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{row.value}</span>
              <span className="whitespace-nowrap text-xs text-slate-400">{row.time}</span>
            </li>
          ))}
        </ol>
      </div>

      {rows.length > timeline.length && (
        <p className="text-center text-xs text-slate-400">
          Chỉ hiển thị {timeline.length} lượt gần nhất. Xem đầy đủ có phân trang tại{" "}
          <Link href={`/search?q=${encodeURIComponent(playerName)}`} className="underline">
            trang Tìm kiếm
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense>
      <PlayerContent />
    </Suspense>
  );
}
