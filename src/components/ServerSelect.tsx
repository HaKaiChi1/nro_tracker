"use client";

import { useRouter } from "next/navigation";
import { SERVER_COOKIE } from "@/lib/config";

export function ServerSelect({ servers, current }: { servers: string[]; current: string }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(event) => {
        document.cookie = `${SERVER_COOKIE}=${encodeURIComponent(
          event.target.value
        )}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
      aria-label="Chọn server"
    >
      {servers.map((server) => (
        <option key={server} value={server}>
          {server}
        </option>
      ))}
    </select>
  );
}
