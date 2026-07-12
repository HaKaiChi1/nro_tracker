"use client";

import { useMemo, useState } from "react";
import { VerticalBarChart } from "./charts/VerticalBarChart";

interface TimelineRow {
  id: number;
  time: string;
  value: string | null;
}

export function PlayerDetailButton({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TimelineRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "chart">("table");

  async function handleOpen() {
    setOpen(true);
    if (rows || loading) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/players/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Không tải được dữ liệu.");
      const data = (await res.json()) as { rows: TimelineRow[] };
      setRows(data.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  const timeline = rows ? [...rows].reverse().slice(0, 200) : [];
  const first = rows?.[0];
  const last = rows?.[rows.length - 1];

  const daily = useMemo(() => {
    if (!rows) return [];
    const byDate = new Map<string, number>();
    for (const row of rows) {
      const date = row.time.slice(0, 10);
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }
    return Array.from(byDate, ([date, drops]) => ({ date, drops })).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [rows]);

  return (
    <>
      <button type="button" onClick={handleOpen} className="font-medium hover:underline">
        {name}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold">{name}</h2>
                {rows && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {rows.length.toLocaleString("vi-VN")} lượt drop
                    {first ? ` · lần đầu ${first.time}` : ""}
                    {last ? ` · gần nhất ${last.time}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {rows && rows.length > 0 && (
                  <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setView("table")}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        view === "table"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      📋 Bảng
                    </button>
                    <button
                      type="button"
                      onClick={() => setView("chart")}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        view === "chart"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      📊 Biểu đồ
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4">
              {loading && <p className="text-sm text-slate-400">Đang tải...</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {rows && rows.length === 0 && (
                <p className="text-sm text-slate-400">Không có dữ liệu.</p>
              )}

              {rows && rows.length > 0 && view === "table" && (
                <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                  {timeline.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="text-sm">{row.value}</span>
                      <span className="whitespace-nowrap text-xs text-slate-400">{row.time}</span>
                    </li>
                  ))}
                </ol>
              )}

              {rows && rows.length > 0 && view === "chart" && (
                <VerticalBarChart data={daily} xKey="date" color="#6366f1" rotateLabels height={320} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
