import type { HeatmapCell } from "@/lib/stats-client";
import { DOW_LABELS } from "@/lib/stats-client";

function colorFor(value: number, max: number): string {
  if (max === 0 || value === 0) return "rgb(226 232 240 / 0.4)";
  const ratio = value / max;
  const alpha = 0.15 + ratio * 0.85;
  return `rgb(99 102 241 / ${alpha.toFixed(2)})`;
}

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  const max = Math.max(0, ...cells.map((c) => c.drops));

  const grid = new Map<string, number>();
  for (const cell of cells) grid.set(`${cell.dow}-${cell.hour}`, cell.drops);

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid min-w-[720px] grid-cols-[40px_repeat(24,1fr)] gap-1">
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center text-[10px] text-slate-400">
            {h}
          </div>
        ))}

        {DOW_LABELS.map((label, dow) => (
          <div className="contents" key={label}>
            <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
            </div>
            {Array.from({ length: 24 }, (_, hour) => {
              const value = grid.get(`${dow}-${hour}`) ?? 0;
              return (
                <div
                  key={hour}
                  title={`${label} ${hour}h: ${value} drop`}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: colorFor(value, max) }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Màu càng đậm = càng nhiều thông báo. Ô sáng nhất tương ứng {max} thông báo.
      </p>
    </div>
  );
}
