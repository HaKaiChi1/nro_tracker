"use client";

import { useRouter } from "next/navigation";

export function DateSelect({ dates, current }: { dates: string[]; current: string }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(event) => {
        router.push(`/players?date=${encodeURIComponent(event.target.value)}`);
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
      aria-label="Chọn ngày"
    >
      {dates.map((date) => (
        <option key={date} value={date}>
          {date}
        </option>
      ))}
    </select>
  );
}
