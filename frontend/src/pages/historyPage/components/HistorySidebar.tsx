import { Route } from "lucide-react";
import { RadioVirtualList } from "@/pages/mapPage/components/RadioVirtualList.tsx";
import type { Radio } from "@/types/Radio.ts";

interface HistorySidebarProps {
  radios: Radio[];
  pointCount: number;
  selectedRadioId?: string;
  onSelect: (radio: Radio) => void;
}

export function HistorySidebar({
  radios,
  pointCount,
  selectedRadioId,
  onSelect,
}: HistorySidebarProps) {
  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-r border-border bg-white md:flex">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-blue-accent" />
          <h1 className="text-lg font-semibold text-navy">Historique</h1>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-muted p-2">
            <div className="text-slate">Radios</div>
            <div className="mt-1 text-base font-semibold text-navy">{radios.length}</div>
          </div>
          <div className="rounded-md bg-muted p-2">
            <div className="text-slate">Points</div>
            <div className="mt-1 text-base font-semibold text-navy">{pointCount}</div>
          </div>
        </div>
      </div>

      <RadioVirtualList radios={radios} onSelect={onSelect} selectedId={selectedRadioId} />
    </aside>
  );
}
