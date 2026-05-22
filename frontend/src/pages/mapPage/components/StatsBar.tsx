interface Stats {
  total: number;
  active: number;
  offline: number;
  stolen: number;
}

interface StatsBarProps {
  stats: Stats;
}

const STAT_ITEMS = [
  { key: "total", label: "Total" },
  { key: "active", label: "Actifs" },
  { key: "offline", label: "Hors ligne" },
  { key: "stolen", label: "Volés" },
] as const;

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex h-12 items-center gap-0 border-b border-border bg-white px-4">
      {STAT_ITEMS.map((item, i) => (
        <div
          key={item.key}
          className={`flex items-baseline gap-2 px-4 ${i > 0 ? "border-l border-border" : ""}`}
        >
          <span className="text-base font-semibold text-navy tabular-nums">
            {stats[item.key].toLocaleString("fr-FR")}
          </span>
          <span className="text-xs text-slate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
