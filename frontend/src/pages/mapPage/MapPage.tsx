import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapPin } from "lucide-react";

import { useRadioStore, selectFilteredRadios } from "@/store/radioStore.ts";
import { generateMockRadios } from "@/services/mockRadios.ts";
import { startSimulation, stopSimulation } from "@/services/socket.ts";
import { Radio } from "@/types/Radio.ts";
import "./map.css";
import { PanTo } from "./components/PanTo.tsx";
import { TileSwitcher } from "./components/TileSwitcher.tsx";
import { RadioVirtualList } from "./components/RadioVirtualList.tsx";
import { StatsBar } from "./components/StatsBar.tsx";
import { DetailPanel } from "./components/DetailPanel.tsx";
import { MobileDrawer } from "./components/MobileDrawer.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { SidebarHeader } from "./components/SidebarHeader.tsx";

import { TILE_LAYERS, TileKey } from "@/lib/tileLayers.ts";
import { ClusteredMarkers } from "@/pages/mapPage/components/ClusteredMarkers.tsx";

export default function MapPage() {
  // — Store —
  const radios = useRadioStore((s) => s.radios);
  const setRadios = useRadioStore((s) => s.setRadios);
  const filterStatus = useRadioStore((s) => s.filterStatus);
  const setFilterStatus = useRadioStore((s) => s.setFilterStatus);
  const searchQuery = useRadioStore((s) => s.searchQuery);
  const setSearchQuery = useRadioStore((s) => s.setSearchQuery);
  const selectedRadio = useRadioStore((s) => s.selectedRadio);
  const setSelectedRadio = useRadioStore((s) => s.setSelectedRadio);

  // — Local UI state —
  const [tileKey, setTileKey] = useState<TileKey>("plan");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [panTarget, setPanTarget] = useState<Radio | null>(null);

  // — Bootstrap —
  useEffect(() => {
    if (useRadioStore.getState().radios.length === 0) {
      setRadios(generateMockRadios(5000));
    }
    startSimulation(5000);
    return () => stopSimulation();
  }, [setRadios]);

  // — Derived data —
  const filtered = useMemo(
    () => selectFilteredRadios({ radios, filterStatus, searchQuery } as never),
    [radios, filterStatus, searchQuery],
  );

  const stats = useMemo(() => {
    let active = 0,
      offline = 0,
      stolen = 0;
    for (const r of radios) {
      if (r.active) active++;
      else offline++;
      if (r.isStolen) stolen++;
    }
    return { total: radios.length, active, offline, stolen };
  }, [radios]);

  // — Handlers —
  const handleSelect = (r: Radio) => {
    setSelectedRadio(r);
    setPanTarget(r);
    setMobileDrawerOpen(false);
  };

  // — Shared sidebar content (reused in desktop sidebar + mobile drawer) —
  const sidebarContent = (
    <>
      <SidebarHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        count={filtered.length}
        onCollapse={() => setSidebarOpen(false)}
      />
      <RadioVirtualList
        radios={filtered}
        onSelect={handleSelect}
        selectedId={selectedRadio?.radioId}
      />
    </>
  );

  const mobileDrawerContent = (
    <>
      <SidebarHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        count={filtered.length}
        onCollapse={() => setMobileDrawerOpen(false)}
        isMobile
      />
      <div className="flex-1 min-h-0">
        <RadioVirtualList
          radios={filtered}
          onSelect={handleSelect}
          selectedId={selectedRadio?.radioId}
        />
      </div>
    </>
  );

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] w-[calc(100%+3rem)]">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(true)}>
        {sidebarContent}
      </Sidebar>

      {/* Map column */}
      <div className="relative flex flex-1 flex-col min-w-0">
        <StatsBar stats={stats} />

        {/* Mobile open list button */}
        <button
          className="absolute left-3 top-16 z-[1000] md:hidden flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium text-navy shadow"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <MapPin className="h-4 w-4" /> List ({filtered.length})
        </button>

        <div className="relative flex-1">
          <MapContainer
            center={[34.7, 11.0]}
            zoom={7}
            scrollWheelZoom
            className="h-full w-full"
            preferCanvas
          >
            <TileLayer
              key={tileKey}
              url={TILE_LAYERS[tileKey].url}
              attribution={TILE_LAYERS[tileKey].attribution}
            />
            <ClusteredMarkers radios={filtered} onSelect={handleSelect} />
            <PanTo target={panTarget} />
          </MapContainer>

          <TileSwitcher value={tileKey} onChange={setTileKey} />
        </div>
      </div>

      {/* Detail panel */}
      {selectedRadio && (
        <DetailPanel radio={selectedRadio} onClose={() => setSelectedRadio(null)} />
      )}

      {/* Mobile drawer */}
      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
        {mobileDrawerContent}
      </MobileDrawer>
    </div>
  );
}
