import Link from "next/link";
import { SummaryCard } from "@/components/SummaryCard";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AutoUpdateBadge } from "@/components/AutoUpdateBadge";
import { ChartCard } from "@/components/ChartCard";
import { HorizontalBarChart } from "@/components/charts/HorizontalBarChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { DailyBreakdownCharts } from "@/components/charts/DailyBreakdownCharts";
import {
  dailyDistribution,
  dropTimesByPlayerForDate,
  hourlyDistribution,
  hourlyDistributionForDate,
  playersByHourForDate,
  recentDates,
  summary,
  topItems,
  topPlayers,
  topPlayersForDate,
} from "@/lib/statistics";
import { getSelectedServer } from "@/lib/server-selection";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const server = await getSelectedServer();
  const stats = summary(server);
  const players = topPlayers(server, 10);
  const items = topItems(server, 10);
  const hourly = hourlyDistribution(server);
  const daily = dailyDistribution(server).slice(-30);
  const days = recentDates(server, 4).map((date) => ({
    date,
    hourly: hourlyDistributionForDate(server, date),
    players: topPlayersForDate(server, date, 10),
    hourlyPlayers: playersByHourForDate(server, date),
    playerTimes: dropTimesByPlayerForDate(server, date),
  }));

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalSeconds={5} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Thống kê — {server}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dữ liệu thu thập từ service.dungpham.com.vn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AutoUpdateBadge lastPollAt={stats.lastPollAt} />
          <a href="/api/export" className="btn-outline">
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
        Xem danh sách toàn bộ người nhặt đồ tại trang{" "}
        <Link href="/players" className="underline">
          Người nhặt đồ
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
