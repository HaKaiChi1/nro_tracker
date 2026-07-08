const ACCENTS: Record<string, string> = {
  indigo: "border-l-indigo-500",
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  slate: "border-l-slate-500",
};

export function SummaryCard({
  title,
  value,
  accent = "slate",
}: {
  title: string;
  value: string | number;
  accent?: keyof typeof ACCENTS;
}) {
  return (
    <div className={`card border-l-4 ${ACCENTS[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 truncate text-xl font-bold">{value}</p>
    </div>
  );
}
