"use client";

import Link from "next/link";
import { SummaryCard } from "@/components/SummaryCard";
import { AutoUpdateBadge } from "@/components/AutoUpdateBadge";
import { ChartCard } from "@/components/ChartCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { DailyBreakdownCharts } from "@/components/charts/DailyBreakdownCharts";
import {
  dailyDistribution,
  hourlyDistribution,
  hourlyDistributionForDate,
  recentDates,
  sortNewestFirst,
  summary,
  topItems,
  topPlayers,
  topPlayersForDate,
} from "@/lib/stats-client";
import { useServerData } from "@/lib/use-server-data";
import { withBase } from "@/lib/base-path";
import { serverSlug } from "@/lib/types";

export default function StatisticsPage() {
  const { server, rows: rawRows, generatedAt } = useServerData();
  const rows = sortNewestFirst(rawRows);

  const stats = summary(rows);
  const players = topPlayers(rows, 10);
  const items = topItems(rows, 10);
  const hourly = hourlyDistribution(rows);
  const daily = dailyDistribution(rows).slice(-30);
  const days = recentDates(rows, 4).map((date) => ({
    date,
    hourly: hourlyDistributionForDate(rows, date),
    players: topPlayersForDate(rows, date, 10),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Thống kê — {server}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dữ liệu thu thập từ service.dungpham.com.vn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoUpdateBadge lastPollAt={generatedAt} />
          <a href={withBase(`/data/${serverSlug(server)}.csv`)} download className="btn-outline">
            ⬇️ Xuất CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Tổng số bản ghi" value={stats.totalRecords.toLocaleString("vi-VN")} accent="indigo" />
        <SummaryCard title="Thời gian mới nhất" value={stats.latestTime} accent="emerald" />
        <SummaryCard title="Người chơi mới nhất" value={stats.latestPlayer} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Top người chơi nhặt được nhiều Set nhất">
          <HorizontalBarChart data={players.map((p) => ({ name: p.name, drops: p.drops }))} />
        </ChartCard>

        <ChartCard title="Top item xuất hiện nhiều nhất">
          <HorizontalBarChart data={items.map((i) => ({ name: i.name, drops: i.drops }))} color="#10b981" />
        </ChartCard>

        <ChartCard title="Phân bố theo giờ trong ngày">
          <VerticalBarChart data={hourly} xKey="hour" color="#f59e0b" />
        </ChartCard>

        <ChartCard title="Số lượng theo ngày (30 ngày gần nhất)">
          <VerticalBarChart data={daily} xKey="date" color="#818cf8" rotateLabels />
        </ChartCard>

        <DailyBreakdownCharts days={days} />
      </div>

      <p className="text-center text-xs text-slate-400">
        Xem chi tiết theo giờ × ngày trong tuần tại trang{" "}
        <Link href="/heatmap" className="underline">
          Heatmap
        </Link>{" "}
        hoặc tra cứu lịch sử một người chơi tại trang{" "}
        <Link href="/search" className="underline">
          Tìm kiếm
        </Link>
        .
      </p>
    </div>
  );
}
