"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

export function HorizontalBarChart({
  data,
  color = "#6366f1",
  height = 320,
}: {
  data: { name: string; drops: number }[];
  color?: string;
  height?: number;
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
          width={110}
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey="drops" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length] ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmptyState() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      Chưa có dữ liệu
    </div>
  );
}
