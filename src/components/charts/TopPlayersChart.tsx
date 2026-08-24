"use client";

import { HorizontalBarChart } from "./HorizontalBarChart";
import { daysSince } from "@/lib/date";
import type { NamedCountWithFirstDate } from "@/lib/statistics";

export function TopPlayersChart({ players }: { players: NamedCountWithFirstDate[] }) {
  return (
    <HorizontalBarChart
      data={players}
      tooltipExtra={(item) => {
        const firstDate = players.find((p) => p.name === item.name)?.firstDate;
        if (!firstDate) return null;
        return (
          <div className="mt-1 border-t border-slate-700 pt-1 text-slate-300">
            Ngày đầu: {firstDate} ({daysSince(firstDate)} ngày)
          </div>
        );
      }}
    />
  );
}
