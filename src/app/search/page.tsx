import Link from "next/link";
import { searchDailyDistribution, searchNotifications } from "@/lib/statistics";
import { getSelectedServer } from "@/lib/server-selection";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { ChartCard } from "@/components/ChartCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function buildHref(q: string, page: number, view: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  if (view !== "table") params.set("view", view);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; view?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const page = Math.max(1, Number(params.page) || 1);
  const view = params.view === "chart" ? "chart" : "table";

  const server = await getSelectedServer();

  const { rows, total } = q
    ? searchNotifications(q, server, page, PAGE_SIZE)
    : { rows: [], total: 0 };

  const daily = q && view === "chart" ? searchDailyDistribution(q, server) : [];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tìm kiếm theo tên người chơi</h1>

      <form className="flex gap-2" action="/search">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Nhập tên nhân vật, ví dụ: kakapote"
          className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
        />
        {view === "chart" && <input type="hidden" name="view" value="chart" />}
        <button type="submit" className="btn-primary">
          Tìm
        </button>
      </form>

      {q && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tìm thấy {total.toLocaleString("vi-VN")} kết quả cho &ldquo;{q}&rdquo;
          </p>

          <div className="flex gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
            <Link
              href={buildHref(q, 1, "table")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === "table"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              📋 Bảng
            </Link>
            <Link
              href={buildHref(q, 1, "chart")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                view === "chart"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              📊 Biểu đồ
            </Link>
          </div>
        </div>
      )}

      {q && view === "chart" && (
        <ChartCard title={`Số lượng theo ngày — ${q}`}>
          <VerticalBarChart data={daily} xKey="date" color="#6366f1" rotateLabels height={400} />
        </ChartCard>
      )}

      {view === "table" && (
      <>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Người chơi</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                <td className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400">{row.time}</td>
                <td className="px-4 py-2 font-medium">
                  <Link href={`/players/${encodeURIComponent(row.player_name ?? "")}`} className="hover:underline">
                    {row.player_name}
                  </Link>
                </td>
                <td className="px-4 py-2">{row.item_name ?? "-"}</td>
                <td className="px-4 py-2">{row.category ?? "-"}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{row.value}</td>
              </tr>
            ))}

            {q && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Không có kết quả.
                </td>
              </tr>
            )}

            {!q && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nhập tên người chơi để tìm kiếm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {q && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Link
            href={buildHref(q, Math.max(1, page - 1), view)}
            className={`btn-outline ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ← Trước
          </Link>
          <span className="text-slate-500 dark:text-slate-400">
            Trang {page} / {totalPages}
          </span>
          <Link
            href={buildHref(q, Math.min(totalPages, page + 1), view)}
            className={`btn-outline ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Sau →
          </Link>
        </div>
      )}
      </>
      )}
    </div>
  );
}
