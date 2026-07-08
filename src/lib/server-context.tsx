"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SERVER, SERVERS } from "./site-config";

// Server đang chọn trên giao diện — trước đây lưu cookie và render phía server,
// giờ site là trang tĩnh nên lưu localStorage và render phía client.
const STORAGE_KEY = "nro_server";

interface ServerContextValue {
  server: string;
  setServer: (server: string) => void;
}

const ServerContext = createContext<ServerContextValue>({
  server: DEFAULT_SERVER,
  setServer: () => {},
});

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [server, setServerState] = useState(DEFAULT_SERVER);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SERVERS.includes(saved)) {
      setServerState(saved);
    }
  }, []);

  const setServer = (value: string) => {
    if (!SERVERS.includes(value)) return;
    setServerState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return <ServerContext.Provider value={{ server, setServer }}>{children}</ServerContext.Provider>;
}

export function useServer(): ServerContextValue {
  return useContext(ServerContext);
}
