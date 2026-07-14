"use client";

import { useState } from "react";
import { ChartCard } from "@/components/ChartCard";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { VerticalBarChart } from "./VerticalBarChart";
import type { HourlyPoint, NamedCount } from "@/lib/statistics";

export interface DayStats {
  date: string; // YYYY-MM-DD
  hourly: HourlyPoint[];
  players: NamedCount[];
  hourlyPlayers: Record<string, NamedCount[]>;
  playerTimes: Record<string, string[]>;
}

function formatDay(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

function DaySelect({
  days,
  value,
  onChange,
}: {
  days: DayStats[];
  value: string;
  onChange: (date: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
      aria-label="Chọn ngày"
    >
      {days.map((day) => (
        <option key={day.date} value={day.date}>
          {formatDay(day.date)}
        </option>
      ))}
    </select>
  );
}

export function DailyBreakdownCharts({ days }: { days: DayStats[] }) {
  const [hourlyDate, setHourlyDate] = useState(days[0]?.date ?? "");
  const [playersDate, setPlayersDate] = useState(days[0]?.date ?? "");

  // Fallback về ngày mới nhất khi đổi server làm ngày đang chọn biến mất.
  const hourlyDay = days.find((d) => d.date === hourlyDate) ?? days[0];
  const playersDay = days.find((d) => d.date === playersDate) ?? days[0];

  return (
    <>
      <ChartCard
        title="Số lượng drops trong ngày theo giờ"
        action={
          days.length > 0 && (
            <DaySelect days={days} value={hourlyDay?.date ?? ""} onChange={setHourlyDate} />
          )
        }
      >
        <VerticalBarChart
          data={hourlyDay?.hourly ?? []}
          xKey="hour"
          color="#f59e0b"
          tooltipExtra={(item) => {
            const players = hourlyDay?.hourlyPlayers[item.hour] ?? [];
            if (players.length === 0) return null;
            return (
              <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto border-t border-slate-700 pt-1">
                {players.map((p) => (
                  <li key={p.name} className="text-slate-300">
                    {p.name} ({p.drops})
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </ChartCard>

      <ChartCard
        title="Top người chơi nhặt được nhiều Set nhất trong ngày"
        action={
          days.length > 0 && (
            <DaySelect days={days} value={playersDay?.date ?? ""} onChange={setPlayersDate} />
          )
        }
      >
        <HorizontalBarChart
          data={playersDay?.players ?? []}
          tooltipExtra={(item) => {
            const times = playersDay?.playerTimes[item.name] ?? [];
            if (times.length === 0) return null;
            return (
              <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto border-t border-slate-700 pt-1">
                {times.map((t) => (
                  <li key={t} className="text-slate-300">
                    {t}
                  </li>
                ))}
              </ul>
            );
          }}
        />
      </ChartCard>
    </>
  );
}
