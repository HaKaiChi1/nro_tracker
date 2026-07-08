"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./HorizontalBarChart";

export function VerticalBarChart<T extends object>({
  data,
  xKey,
  yKey = "drops" as keyof T & string,
  color = "#6366f1",
  height = 320,
  rotateLabels = false,
}: {
  data: T[];
  xKey: keyof T & string;
  yKey?: keyof T & string;
  color?: string;
  height?: number;
  rotateLabels?: boolean;
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
          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
