"use client";

import { ChartCard } from "@/components/ChartCard";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import type { DailyCount } from "@/lib/statistics";

function shortDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

export function DailyChart({ title, data }: { title: string; data: DailyCount[] }) {
  const chartData = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <ChartCard
      title={title}
      action={<span className="text-xs text-slate-400">{data.length} ngày gần nhất</span>}
    >
      <VerticalBarChart
        data={chartData}
        xKey="label"
        yKey="count"
        yLabel="số đợt"
        color="#818cf8"
        rotateLabels
        tooltipExtra={(item) =>
          item.byLocation.length > 0 ? (
            <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto border-t border-slate-700 pt-1">
              {item.byLocation.map((loc) => (
                <li key={loc.name} className="text-slate-300">
                  {loc.name} ({loc.count})
                </li>
              ))}
            </ul>
          ) : null
        }
      />
    </ChartCard>
  );
}
