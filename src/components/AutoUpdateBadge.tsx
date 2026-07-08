import { formatPollAgo } from "@/lib/time";

export function AutoUpdateBadge({ lastPollAt }: { lastPollAt: string | null }) {
  return (
    <span className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      Tự động cập nhật{formatPollAgo(lastPollAt)}
    </span>
  );
}
