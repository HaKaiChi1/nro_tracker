"use client";

import { ChartCard } from "@/components/ChartCard";
import { Heatmap } from "@/components/charts/Heatmap";
import { heatmap } from "@/lib/stats-client";
import { useServerData } from "@/lib/use-server-data";

export default function HeatmapPage() {
  const { server, rows } = useServerData();
  const cells = heatmap(rows);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Heatmap hoạt động</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mật độ thông báo theo giờ trong ngày và ngày trong tuần — giúp thấy khung giờ nào đông
          người farm nhất.
        </p>
      </div>

      <ChartCard title={`Server: ${server}`}>
        <Heatmap cells={cells} />
      </ChartCard>
    </div>
  );
}
