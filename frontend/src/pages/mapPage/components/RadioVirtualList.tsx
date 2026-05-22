import { List } from "react-window";
import { Radio } from "@/types/Radio.ts";
import { RadioRow } from "./RadioRow.tsx";

interface RadioVirtualListProps {
  radios: Radio[];
  onSelect: (r: Radio) => void;
  selectedId?: string;
}

export function RadioVirtualList({ radios, onSelect, selectedId }: RadioVirtualListProps) {
  return (
    <div className="flex-1 min-h-0">
      <List
        rowComponent={RadioRow}
        rowCount={radios.length}
        rowHeight={84}
        rowProps={{ radios, onSelect, selectedId } as never}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
