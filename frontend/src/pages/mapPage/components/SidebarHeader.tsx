import { Search, X, ChevronLeft } from "lucide-react";
import { FilterStatus } from "@/store/radioStore.ts";

interface SidebarHeaderProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (s: FilterStatus) => void;
  count: number;
  onCollapse: () => void;
  isMobile?: boolean;
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
  { value: "stolen", label: "Volés" },
];

export function SidebarHeader({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  count,
  onCollapse,
  isMobile,
}: SidebarHeaderProps) {
  return (
    <div className="border-b border-border p-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (nom, série, équipe)…"
            className="w-full rounded-md border border-border bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-accent/30"
          />
        </div>
        <button
          onClick={onCollapse}
          className="rounded-md p-2 text-slate hover:bg-muted"
          aria-label="Réduire"
        >
          {isMobile ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => {
          const active = filterStatus === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-blue-accent text-white"
                  : "bg-muted text-slate hover:bg-blue-light hover:text-navy"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="text-[11px] uppercase tracking-wide text-slate">{count} radios</div>
    </div>
  );
}
