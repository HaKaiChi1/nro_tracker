import type { ReactNode } from "react";

export function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
