import type { LocationStat } from "@/lib/statistics";

export function LocationChart({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: LocationStat[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="card flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-2">
        {data.map((item, i) => {
          const width = Math.max(3, Math.round((item.count / max) * 100));
          const isTop = i === 0;

          return (
            <div
              key={item.name}
              className="flex items-center gap-3"
              title={`${item.name}: ${item.count.toLocaleString("vi-VN")} lần xuất hiện`}
            >
              <span
                className={`w-36 shrink-0 truncate text-right text-sm ${
                  isTop
                    ? "font-semibold text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.name}
              </span>

              <div className="h-5 flex-1">
                <div
                  className={`h-5 rounded-r ${isTop ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`}
                  style={{ width: `${width}%` }}
                />
              </div>

              <span
                className={`w-14 shrink-0 text-sm tabular-nums ${
                  isTop
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {item.count.toLocaleString("vi-VN")}
              </span>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-slate-400">Chưa có dữ liệu.</div>
        )}
      </div>
    </div>
  );
}
