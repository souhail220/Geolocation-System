import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function Sidebar({ open, onToggle, children }: SidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-white transition-all duration-200 ${
        open ? "w-80" : "w-10"
      }`}
    >
      {open ? (
        children
      ) : (
        <button
          onClick={onToggle}
          className="flex h-full w-full items-center justify-center text-slate hover:bg-muted"
          aria-label="Ouvrir la liste"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </aside>
  );
}
