import type { NamecTimelineEntry } from "@/lib/statistics";
import { timeAgoVi } from "@/lib/time";

// 3 địa điểm trung tâm chiếm phần lớn lượt xuất hiện — mỗi địa điểm 1 màu
// riêng để nhìn là nhận ra ngay; các địa điểm hiếm gộp chung màu xám.
const LOCATION_BADGE: Record<string, string> = {
  "Đông Nam Guru": "bg-indigo-500",
  "Nam Guru": "bg-emerald-500",
  "Thung lũng Maima": "bg-amber-500",
};
const OTHER_BADGE = "bg-slate-400 dark:bg-slate-600";

function badgeClass(location: string): string {
  return LOCATION_BADGE[location] ?? OTHER_BADGE;
}

function formatDay(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function Timeline({ entries }: { entries: NamecTimelineEntry[] }) {
  const day = entries[0]?.time.slice(0, 10);

  return (
    <div className="card flex h-full flex-col">
      <h2 className="mb-3 shrink-0 text-sm font-semibold text-slate-600 dark:text-slate-300">
        {entries.length} lần xuất hiện trong ngày{day ? ` ${formatDay(day)}` : ""} (Namec)
      </h2>

      {entries.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-slate-400">
          Chưa có dữ liệu
        </div>
      ) : (
        <ol className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto border-l border-slate-200 py-1 pl-4 pr-1 dark:border-slate-800">
          {entries.map((e) => (
            <li key={`${e.time}-${e.location}`} className="relative flex items-center gap-3">
              <span className="absolute -left-[21px] h-2 w-2 rounded-full bg-slate-300 ring-4 ring-white dark:bg-slate-600 dark:ring-slate-900" />

              <span
                className={`rounded-md px-2.5 py-1 text-sm font-semibold text-white ${badgeClass(e.location)}`}
              >
                {e.location}
              </span>

              <span className="text-xs text-slate-400">{timeAgoVi(e.time)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
