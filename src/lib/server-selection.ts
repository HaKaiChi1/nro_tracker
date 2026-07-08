import { cookies } from "next/headers";
import { config, SERVER_COOKIE } from "./config";

// Server đang được chọn trên giao diện (lưu trong cookie, đổi bằng dropdown ở Nav).
export async function getSelectedServer(): Promise<string> {
  const store = await cookies();
  const value = store.get(SERVER_COOKIE)?.value;
  return value && config.servers.includes(value) ? value : config.server;
}
