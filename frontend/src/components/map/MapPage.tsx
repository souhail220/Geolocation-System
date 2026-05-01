import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { useRadioStore, selectFilteredRadios, type FilterStatus } from "@/store/radioStore";
import { generateMockRadios } from "@/services/mockRadios";
import { startSimulation, stopSimulation, onRadioFlash } from "@/services/socket";
import type { Radio } from "@/types/radio";
import { Search, X, ChevronLeft, ChevronRight, MapPin, Layers } from "lucide-react";
import { List } from "react-window";
import "./map.css";

const TILE_LAYERS = {
  plan: {
    label: "Plan",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  terrain: {
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
  },
} as const;
type TileKey = keyof typeof TILE_LAYERS;

function radioStatus(r: Radio): "active" | "inactive" | "stolen" {
  if (r.isStolen) return "stolen";
  return r.active ? "active" : "inactive";
}

function batteryColor(pct: number): string {
  if (pct > 50) return "#059669";
  if (pct >= 20) return "#D97706";
  return "#DC2626";
}

function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Imperatively manages a MarkerClusterGroup of all radios. */
function ClusteredMarkers({
  radios,
  onSelect,
}: {
  radios: Radio[];
  onSelect: (r: Radio) => void;
}) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Build cluster group once
  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);
    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
      markersRef.current.clear();
    };
  }, [map]);

  // Sync markers when radios array reference changes
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();
    markersRef.current.clear();

    const layers: L.Marker[] = [];
    for (const r of radios) {
      const status = radioStatus(r);
      const icon = L.divIcon({
        className: "",
        html: `<div class="radio-marker ${status}" data-rid="${r.radioId}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([r.latitude, r.longitude], { icon }) as L.Marker & { _radio?: Radio };
      marker._radio = r;
      marker.bindPopup(buildPopupHtml(r));
      marker.on("click", () => onSelect(r));
      markersRef.current.set(r.radioId, marker);
      layers.push(marker);
    }
    cluster.addLayers(layers);
  }, [radios, onSelect]);

  // Flash handler — briefly scales the marker icon
  useEffect(() => {
    return onRadioFlash((radioId) => {
      const m = markersRef.current.get(radioId);
      if (!m) return;
      const el = m.getElement()?.querySelector(".radio-marker") as HTMLElement | null;
      if (!el) return;
      el.classList.add("flash");
      globalThis.setTimeout(() => el.classList.remove("flash"), 280);
      // Update position to current store value
      const fresh = useRadioStore.getState().radios.find((x) => x.radioId === radioId);
      if (fresh) {
        m.setLatLng([fresh.latitude, fresh.longitude]);
        m.setPopupContent(buildPopupHtml(fresh));
      }
    });
  }, []);

  return null;
}

function buildPopupHtml(r: Radio): string {
  const status = radioStatus(r);
  const statusLabel = status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "Volé";
  const statusColor = status === "active" ? "#059669" : status === "inactive" ? "#D97706" : "#DC2626";
  const battColor = batteryColor(r.battery);
  return `
    <div style="min-width:220px;font-size:12px;color:#0F172A">
      <div style="font-weight:600;font-size:13px">${escapeHtml(r.name)}</div>
      <div style="color:#64748B;margin-bottom:6px">${escapeHtml(r.serialNumber)}</div>
      <div style="margin:2px 0"><b>Équipe:</b> ${escapeHtml(r.team)}</div>
      <div style="margin:4px 0"><b>Batterie:</b> ${r.battery.toFixed(0)}%
        <div style="background:#E2E8F0;border-radius:4px;height:4px;margin-top:2px">
          <div style="width:${Math.max(0, Math.min(100, r.battery))}%;height:100%;background:${battColor};border-radius:4px"></div>
        </div>
      </div>
      <div style="margin:2px 0"><b>Signal:</b> ${r.signalStrength} dBm</div>
      <div style="margin:2px 0"><b>Statut:</b> <span style="color:${statusColor};font-weight:600">${statusLabel}</span></div>
      <div style="margin:2px 0;color:#64748B">Mis à jour: ${formatTs(r.timestamp)}</div>
      ${r.outsideZone ? `<div style="margin-top:6px;padding:4px 6px;background:#FEE2E2;color:#991B1B;border-radius:4px">⚠ Hors zone</div>` : ""}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function PanTo({ target }: { target: Radio | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 12), { duration: 0.6 });
  }, [target, map]);
  return null;
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Actifs" },
  { value: "inactive", label: "Inactifs" },
  { value: "stolen", label: "Volés" },
];

export default function MapPage() {
  const radios = useRadioStore((s) => s.radios);
  const setRadios = useRadioStore((s) => s.setRadios);
  const filterStatus = useRadioStore((s) => s.filterStatus);
  const setFilterStatus = useRadioStore((s) => s.setFilterStatus);
  const searchQuery = useRadioStore((s) => s.searchQuery);
  const setSearchQuery = useRadioStore((s) => s.setSearchQuery);
  const selectedRadio = useRadioStore((s) => s.selectedRadio);
  const setSelectedRadio = useRadioStore((s) => s.setSelectedRadio);

  const [tileKey, setTileKey] = useState<TileKey>("plan");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [panTarget, setPanTarget] = useState<Radio | null>(null);

  // Bootstrap mock data + simulation
  useEffect(() => {
    if (useRadioStore.getState().radios.length === 0) {
      setRadios(generateMockRadios(5000));
    }
    startSimulation(5000);
    return () => stopSimulation();
  }, [setRadios]);

  const filtered = useMemo(
    () => selectFilteredRadios({ radios, filterStatus, searchQuery } as any),
    [radios, filterStatus, searchQuery],
  );

  const stats = useMemo(() => {
    let active = 0, offline = 0, stolen = 0;
    for (const r of radios) {
      if (r.active) active++; else offline++;
      if (r.isStolen) stolen++;
    }
    return { total: radios.length, active, offline, stolen };
  }, [radios]);

  const handleSelect = (r: Radio) => {
    setSelectedRadio(r);
    setPanTarget(r);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] w-[calc(100%+3rem)]">
      {/* Sidebar (desktop) */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-white transition-all duration-200 ${
          sidebarOpen ? "w-80" : "w-10"
        }`}
      >
        {sidebarOpen ? (
          <>
            <SidebarHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              count={filtered.length}
              onCollapse={() => setSidebarOpen(false)}
            />
            <RadioVirtualList radios={filtered} onSelect={handleSelect} selectedId={selectedRadio?.radioId} />
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-full w-full items-center justify-center text-slate hover:bg-muted"
            aria-label="Ouvrir la liste"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </aside>

      {/* Map column */}
      <div className="relative flex flex-1 flex-col min-w-0">
        <StatsBar stats={stats} />

        {/* Mobile open list button */}
        <button
          className="absolute left-3 top-16 z-[1000] md:hidden flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-medium text-navy shadow"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <MapPin className="h-4 w-4" /> Liste ({filtered.length})
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
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-[2000] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileDrawerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] flex flex-col rounded-t-2xl bg-white shadow-2xl">
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
              <RadioVirtualList radios={filtered} onSelect={handleSelect} selectedId={selectedRadio?.radioId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarHeader({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  count,
  onCollapse,
  isMobile,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (s: FilterStatus) => void;
  count: number;
  onCollapse: () => void;
  isMobile?: boolean;
}) {
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

function RadioVirtualList({
  radios,
  onSelect,
  selectedId,
}: {
  radios: Radio[];
  onSelect: (r: Radio) => void;
  selectedId?: string;
}) {
  return (
    <div className="flex-1 min-h-0">
      <List
        rowComponent={RadioRow}
        rowCount={radios.length}
        rowHeight={84}
        rowProps={{ radios, onSelect, selectedId } as any}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

function RadioRow({
  index,
  style,
  radios,
  onSelect,
  selectedId,
}: {
  index: number;
  style: React.CSSProperties;
  radios: Radio[];
  onSelect: (r: Radio) => void;
  selectedId?: string;
}) {
  const r = radios[index];
  if (!r) return null;
  const status = radioStatus(r);
  const dot = status === "active" ? "bg-success" : status === "inactive" ? "bg-warning" : "bg-danger";
  const battColor = batteryColor(r.battery);
  const isSelected = r.radioId === selectedId;

  return (
    <div style={style} className="px-2">
      <button
        onClick={() => onSelect(r)}
        className={`mt-1 w-full rounded-md border bg-white p-2.5 text-left transition-colors ${
          isSelected ? "border-blue-accent ring-2 ring-blue-accent/30" : "border-border hover:bg-muted"
        }`}
      >
        <div className="flex items-start gap-2">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-sm font-semibold text-navy">{r.name}</div>
              {r.outsideZone && (
                <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger">
                  Hors zone
                </span>
              )}
            </div>
            <div className="truncate text-xs text-slate">{r.team}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded bg-muted overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${Math.max(0, Math.min(100, r.battery))}%`, background: battColor }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-slate">{r.battery.toFixed(0)}%</span>
              <span className="text-[11px] tabular-nums text-slate">{r.signalStrength} dBm</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function TileSwitcher({ value, onChange }: { value: TileKey; onChange: (k: TileKey) => void }) {
  return (
    <div className="absolute right-3 top-3 z-[1000] flex items-center gap-1 rounded-md border border-border bg-white p-1 shadow">
      <Layers className="ml-1 h-4 w-4 text-slate" />
      {(Object.keys(TILE_LAYERS) as TileKey[]).map((k) => {
        const active = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border border-blue-accent bg-blue-light text-navy"
                : "border border-transparent text-slate hover:bg-muted"
            }`}
          >
            {TILE_LAYERS[k].label}
          </button>
        );
      })}
    </div>
  );
}

function StatsBar({ stats }: { stats: { total: number; active: number; offline: number; stolen: number } }) {
  const items = [
    { label: "Total", value: stats.total },
    { label: "Actifs", value: stats.active },
    { label: "Hors ligne", value: stats.offline },
    { label: "Volés", value: stats.stolen },
  ];
  return (
    <div className="flex h-12 items-center gap-0 border-b border-border bg-white px-4">
      {items.map((it, i) => (
        <div key={it.label} className={`flex items-baseline gap-2 px-4 ${i > 0 ? "border-l border-border" : ""}`}>
          <span className="text-base font-semibold text-navy tabular-nums">{it.value.toLocaleString("fr-FR")}</span>
          <span className="text-xs text-slate">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function DetailPanel({ radio, onClose }: { radio: Radio; onClose: () => void }) {
  const status = radioStatus(radio);
  const statusLabel = status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "Volé";
  const statusCls =
    status === "active"
      ? "bg-success/10 text-success"
      : status === "inactive"
      ? "bg-warning/10 text-warning"
      : "bg-danger/10 text-danger";
  const battColor = batteryColor(radio.battery);
  // Signal: -50 = 100%, -120 = 0%
  const signalPct = Math.max(0, Math.min(100, ((radio.signalStrength + 120) / 70) * 100));

  return (
    <div
      className="fixed right-0 top-14 z-[1500] flex h-[calc(100vh-3.5rem)] w-[360px] max-w-[100vw] flex-col bg-white"
      style={{ boxShadow: "-4px 0 16px rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-navy">{radio.name}</h3>
          <p className="truncate text-xs text-slate">{radio.serialNumber}</p>
          <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls}`}>
            {statusLabel}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-1 text-slate hover:bg-muted" aria-label="Fermer">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        <Row label="Équipe" value={radio.team} />
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate">
            <span>Batterie</span>
            <span className="tabular-nums">{radio.battery.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full rounded" style={{ width: `${radio.battery}%`, background: battColor }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate">
            <span>Signal</span>
            <span className="tabular-nums">{radio.signalStrength} dBm</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full rounded bg-blue-accent" style={{ width: `${signalPct}%` }} />
          </div>
        </div>
        <Row label="Coordonnées" value={`${radio.latitude.toFixed(5)}, ${radio.longitude.toFixed(5)}`} />
        <Row label="Dernière mise à jour" value={formatTs(radio.timestamp)} />

        {radio.outsideZone && (
          <div className="rounded-md border-l-4 border-danger bg-danger/5 p-3 text-xs text-danger">
            ⚠ Cette radio est en dehors de la zone autorisée.
          </div>
        )}
        {radio.isStolen && (
          <div className="rounded-md border-l-4 border-danger bg-danger/5 p-3 text-xs text-danger">
            🚨 Cette radio est signalée comme volée.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
        <button className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-muted">
          Voir l'historique
        </button>
        <button className="rounded-md bg-blue-accent px-3 py-2 text-xs font-medium text-white hover:bg-blue-accent/90">
          Configurer une alerte
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate">{label}</span>
      <span className="text-right text-sm text-navy break-all">{value}</span>
    </div>
  );
}
