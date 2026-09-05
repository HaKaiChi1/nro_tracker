"use client";

import { ChartCard } from "@/components/ChartCard";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import type { CycleStats } from "@/lib/statistics";

function formatMinutes(value: number | null): string {
  if (value == null) return "-";
  return `${Math.round(value)} phút`;
}

export function CycleChart({ title, stats }: { title: string; stats: CycleStats }) {
  const total = stats.buckets.reduce((a, b) => a + b.count, 0);
  const topIndex = stats.buckets.reduce(
    (best, b, i, arr) => (b.count > arr[best].count ? i : best),
    0
  );
  const colors = stats.buckets.map((b, i) => (i === topIndex && b.count > 0 ? "#6366f1" : "#cbd5e1"));

  return (
    <ChartCard
      title={title}
      action={
        <span className="text-xs text-slate-400">
          TB {formatMinutes(stats.avgMinutes)} · Trung vị {formatMinutes(stats.medianMinutes)}
        </span>
      }
    >
      <VerticalBarChart
        data={stats.buckets}
        xKey="label"
        yKey="count"
        yLabel="số đợt"
        colors={colors}
        tooltipExtra={(item) =>
          total > 0 ? (
            <div className="mt-1 border-t border-slate-700 pt-1 text-slate-300">
              {((item.count / total) * 100).toFixed(0)}% tổng số lần chuyển tiếp
            </div>
          ) : null
        }
      />
    </ChartCard>
  );
}
