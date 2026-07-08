"use client";

export function ServerSelect({
  servers,
  current,
  onChange,
}: {
  servers: string[];
  current: string;
  onChange: (server: string) => void;
}) {
  return (
    <select
      value={current}
      onChange={(event) => onChange(event.target.value)}
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
