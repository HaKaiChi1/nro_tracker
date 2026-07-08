import Link from "next/link";
import { notFound } from "next/navigation";
import { playerTimeline } from "@/lib/statistics";
import { getSelectedServer } from "@/lib/server-selection";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const playerName = decodeURIComponent(name);
  const server = await getSelectedServer();
  const rows = playerTimeline(playerName, server);

  if (rows.length === 0) {
    notFound();
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
