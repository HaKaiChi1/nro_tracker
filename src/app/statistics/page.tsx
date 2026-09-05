import { AutoRefresh } from "@/components/AutoRefresh";
import { LocationChart } from "@/components/LocationChart";
import { CycleChart } from "@/components/CycleChart";
import { DailyChart } from "@/components/DailyChart";
import {
  namecLocationStats,
  fideLocationStats,
  cycleStats,
  dailySquadCounts,
} from "@/lib/statistics";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const namecLocations = namecLocationStats();
  const fideLocations = fideLocationStats();
  const namecCycle = cycleStats(undefined, "namec");
  const fideCycle = cycleStats(undefined, "fide");
  const namecDaily = dailySquadCounts(undefined, "namec");
  const fideDaily = dailySquadCounts(undefined, "fide");

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalSeconds={15} />

      <div>
        <h1 className="text-2xl font-bold">Thống kê tổng</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tổng hợp số liệu Tiểu Đội Sát Thủ — tách riêng Namec và Fide
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LocationChart
          title="Khu vực xuất hiện — Namec"
          subtitle="Tổng số lần xuất hiện tại các bản đồ Namec — toàn bộ lịch sử"
          data={namecLocations}
        />
        <LocationChart
          title="Khu vực xuất hiện — Fide"
          subtitle="Tổng số lần xuất hiện tại các bản đồ Fide — toàn bộ lịch sử"
          data={fideLocations}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CycleChart title="Chu kỳ xuất hiện — Namec" stats={namecCycle} />
        <CycleChart title="Chu kỳ xuất hiện — Fide" stats={fideCycle} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DailyChart title="Số đợt theo ngày — Namec" data={namecDaily} />
        <DailyChart title="Số đợt theo ngày — Fide" data={fideDaily} />
      </div>
    </div>
  );
}
