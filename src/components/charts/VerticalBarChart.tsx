"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function EmptyState() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">Chưa có dữ liệu</div>
  );
}

export function VerticalBarChart<T extends object>({
  data,
  xKey,
  yKey = "count" as keyof T & string,
  yLabel = "số lượng",
  color = "#6366f1",
  colors,
  height = 260,
  rotateLabels = false,
  tooltipExtra,
}: {
  data: T[];
  xKey: keyof T & string;
  yKey?: keyof T & string;
  yLabel?: string;
  color?: string;
  colors?: string[];
  height?: number;
  rotateLabels?: boolean;
  tooltipExtra?: (item: T) => ReactNode;
}) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ bottom: rotateLabels ? 24 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
        <XAxis
          dataKey={xKey}
          stroke="#94a3b8"
          fontSize={12}
          angle={rotateLabels ? -40 : 0}
          textAnchor={rotateLabels ? "end" : "middle"}
          height={rotateLabels ? 50 : 30}
        />
        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const item = payload[0].payload as T;
            return (
              <div className="max-w-xs rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                <div className="font-medium">{String(item[xKey])}</div>
                <div className="text-slate-300">
                  {yLabel} : {String(item[yKey])}
                </div>
                {tooltipExtra?.(item)}
              </div>
            );
          }}
        />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]} fill={color}>
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i] ?? color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
