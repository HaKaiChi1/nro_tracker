"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import type { HourlyLocationPoint } from "@/lib/statistics";

// Khớp màu với Timeline: 3 địa điểm trung tâm riêng màu, còn lại gộp "Khác".
const SERIES: { key: keyof Omit<HourlyLocationPoint, "hour">; color: string }[] = [
  { key: "Đông Nam Guru", color: "#6366f1" },
  { key: "Nam Guru", color: "#10b981" },
  { key: "Thung lũng Maima", color: "#f59e0b" },
  { key: "Khác", color: "#94a3b8" },
];

export function HourlyLocationChart({ data }: { data: HourlyLocationPoint[] }) {
  return (
    <ChartCard title="Địa điểm theo giờ trong ngày (Namec)">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
          <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} interval={1} />
          <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              const rows = payload.filter((p) => Number(p.value) > 0);
              if (rows.length === 0) return null;
              return (
                <div className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
                  <div className="mb-1 font-medium">{label}</div>
                  {rows.map((p) => (
                    <div key={p.dataKey as string} className="flex items-center gap-1.5 text-slate-300">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: p.color as string }}
                      />
                      {p.dataKey} : {p.value}
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {SERIES.map((s) => (
            <Bar key={s.key} dataKey={s.key} stackId="loc" fill={s.color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
