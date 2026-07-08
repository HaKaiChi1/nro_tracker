"use client";

import { useEffect, useState } from "react";
import { withBase } from "./base-path";
import { useServer } from "./server-context";
import type { NotificationRow, ServerDataFile } from "./types";
import { serverSlug } from "./types";

// Tần suất kiểm tra file JSON mới trên GitHub Pages. Dữ liệu chỉ đổi khi
// workflow cron chạy (~10 phút/lần) nên 60s là quá đủ.
const REFETCH_SECONDS = 60;

export interface ServerData {
  server: string;
  rows: NotificationRow[];
  generatedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useServerData(): ServerData {
  const { server } = useServer();
  const [state, setState] = useState<Omit<ServerData, "server">>({
    rows: [],
    generatedAt: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    async function load() {
      try {
        const url = withBase(`/data/${serverSlug(server)}.json`);
        const res = await fetch(`${url}?t=${Math.floor(Date.now() / (REFETCH_SECONDS * 1000))}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ServerDataFile;
        if (!cancelled) {
          setState({ rows: data.rows, generatedAt: data.generated_at, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: String(error) }));
        }
      }
    }

    load();
    const id = setInterval(load, REFETCH_SECONDS * 1000);

    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [server]);

  return { server, ...state };
}
