import Link from "next/link";
import { config } from "@/lib/config";

export function ServerTabs({ current, basePath }: { current: string; basePath: string }) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
      {config.servers.map((server) => (
        <Link
          key={server}
          href={`${basePath}?server=${encodeURIComponent(server)}`}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            server === current
              ? "bg-indigo-600 text-white"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {server}
        </Link>
      ))}
    </div>
  );
}
