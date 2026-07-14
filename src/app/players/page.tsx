import { playersForDate, recentDates } from "@/lib/statistics";
import { getSelectedServer } from "@/lib/server-selection";
import { DateSelect } from "@/components/DateSelect";
import { PlayerDetailButton } from "@/components/PlayerDetailButton";

export const dynamic = "force-dynamic";

function daysSince(firstDate: string): number {
  const [y, m, d] = firstDate.split("-").map(Number);
  const first = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(1, Math.floor((today - first) / 86_400_000) + 1);
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const server = await getSelectedServer();

  const dates = recentDates(server, 7);
  const date = params.date && dates.includes(params.date) ? params.date : dates[0];

  const rows = date ? playersForDate(server, date) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Người nhặt đồ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Danh sách người chơi đã nhặt được đồ trong ngày đã chọn, số lượng và ngày đầu tiên ghi
            nhận của người chơi đó.
          </p>
        </div>

        {dates.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Ngày:</span>
            <DateSelect dates={dates} current={date} />
          </div>
        ) : null}
      </div>

      {date && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {rows.length.toLocaleString("vi-VN")} người chơi nhặt được đồ ngày {date}.
        </p>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Người chơi</th>
              <th className="px-4 py-3">Số lượng</th>
              <th className="px-4 py-3">Ngày đầu tiên</th>
              <th className="px-4 py-3">TB/ngày</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const days = daysSince(row.firstDate);
              return (
                <tr key={row.name} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-2 font-medium">
                    <PlayerDetailButton name={row.name} />{" "}
                    <span className="font-normal text-slate-400">
                      ({row.totalDrops.toLocaleString("vi-VN")}/{days})
                    </span>
                  </td>
                  <td className="px-4 py-2">{row.drops.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{row.firstDate}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {(row.totalDrops / days).toLocaleString("vi-VN", {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Không có dữ liệu cho ngày này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
