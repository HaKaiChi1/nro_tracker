import { AutoRefresh } from "@/components/AutoRefresh";
import { Timeline } from "@/components/Timeline";
import { PredictionPanel } from "@/components/PredictionPanel";
import { LocationChart } from "@/components/LocationChart";
import { HourlyLocationChart } from "@/components/HourlyLocationChart";
import {
  namecTimeline,
  namecLocationCountsToday,
  namecHourlyLocationCounts,
  predictNextNamecLocation,
} from "@/lib/statistics";

export const dynamic = "force-dynamic";

export default async function PredictionPage() {
  const timeline = namecTimeline();
  const prediction = predictNextNamecLocation();
  const todayLocations = namecLocationCountsToday();
  const hourly = namecHourlyLocationCounts();
  const day = timeline[0]?.time.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalSeconds={15} />

      <div>
        <h1 className="text-2xl font-bold">Dự đoán</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dự đoán địa điểm xuất hiện tiếp theo — chỉ dựa trên dữ liệu Namec
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Timeline entries={timeline} />

        <div className="flex flex-col gap-6">
          <PredictionPanel result={prediction} />
          <LocationChart
            title={`Số lượng địa điểm đã xuất hiện${day ? ` — ngày ${day.split("-").reverse().join("/")}` : ""}`}
            subtitle="Số lần mỗi địa điểm xuất hiện trong ngày (Namec)"
            data={todayLocations}
          />
        </div>
      </div>

      <HourlyLocationChart data={hourly} />
    </div>
  );
}
