"use client";

import { ChartCard } from "@/components/ChartCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import type { PredictionResult } from "@/lib/statistics";
import { formatDateVi, timeAgoVi } from "@/lib/time";

export function PredictionPanel({ result }: { result: PredictionResult }) {
  const chartData = result.predictions.map((p) => ({
    name: p.name,
    value: Math.round(p.probability * 1000) / 10,
  }));
  const colors = chartData.map((_, i) => (i === 0 ? "#6366f1" : "#cbd5e1"));

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <p className="text-xs text-slate-400">Vị trí xuất hiện gần nhất</p>
        <p className="text-xl font-bold">{result.lastLocation ?? "-"}</p>
        {result.lastTime && (
          <p className="text-xs text-slate-400">
            {formatDateVi(result.lastTime)} · {timeAgoVi(result.lastTime)}
          </p>
        )}
      </div>

      <ChartCard
        title="Dự đoán vị trí xuất hiện tiếp theo"
        action={
          result.lastLocation && (
            <span className="text-xs text-slate-400">
              Dựa trên {result.sampleSize} lần chuyển tiếp từ &quot;{result.lastLocation}&quot;
            </span>
          )
        }
      >
        <HorizontalBarChart
          data={chartData}
          yLabel="xác suất"
          colors={colors}
          formatValue={(v) => `${v}%`}
        />
      </ChartCard>
    </div>
  );
}
