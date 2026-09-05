"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "./VerticalBarChart";

export function HorizontalBarChart<T extends { name: string; value: number }>({
  data,
  yLabel = "giá trị",
  color = "#6366f1",
  colors,
  height = 260,
  width = 110,
  formatValue,
  tooltipExtra,
}: {
  data: T[];
  yLabel?: string;
  color?: string;
  colors?: string[];
  height?: number;
  width?: number;
  formatValue?: (value: number) => string;
  tooltipExtra?: (item: T) => ReactNode;
}) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#94a3b8"
          fontSize={12}
          width={width}
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const item = payload[0].payload as T;
            return (
              <div className="max-h-64 max-w-xs overflow-y-auto rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                <div className="font-medium">{item.name}</div>
                <div className="text-slate-300">
                  {yLabel} : {formatValue ? formatValue(item.value) : item.value}
                </div>
                {tooltipExtra?.(item)}
              </div>
            );
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={color}>
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i] ?? color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
