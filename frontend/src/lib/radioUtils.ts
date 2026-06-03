import type { Radio } from "@/types/Radio.ts";

export function radioStatus(r: Radio): "active" | "inactive" | "stolen" {
  if (r.isStolen) return "stolen";
  return !r.active ? "inactive" : "active";
}

export function batteryColor(pct: number): string {
  const battery = clampPercent(pct);
  if (battery > 50) return "#059669";
  if (battery >= 20) return "#D97706";
  return "#DC2626";
}

export function formatTs(ts: number): string {
  const timestamp = Number(ts);
  if (!Number.isFinite(timestamp)) return "N/A";

  const d = new Date(timestamp * 1000);
  if (Number.isNaN(d.getTime())) return "N/A";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function clampPercent(value: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

export function signalStrengthPercent(signalStrength: number): number {
  const signal = Number(signalStrength);
  if (!Number.isFinite(signal)) return 0;

  // Signal: -50 dBm = 100%, -120 dBm = 0%.
  return clampPercent(((signal + 120) / 70) * 100);
}

export function formatBattery(battery: number): string {
  return `${clampPercent(battery).toFixed(0)}%`;
}

export function formatSignal(signalStrength: number): string {
  const signal = Number(signalStrength);
  return Number.isFinite(signal) ? `${signal} dBm` : "N/A";
}

export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "N/A";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

export function buildPopupHtml(r: Radio): string {
  const status = radioStatus(r);
  const statusLabel = status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "Volé";
  const statusColor =
    status === "active" ? "#059669" : status === "inactive" ? "#D97706" : "#DC2626";
  const battColor = batteryColor(r.battery);
  const batteryPct = clampPercent(r.battery);

  return `
    <div style="min-width:220px;font-size:12px;color:#0F172A">
      <div style="font-weight:600;font-size:13px">${escapeHtml(r.name)}</div>
      <div style="color:#64748B;margin-bottom:6px">${escapeHtml(r.serialNumber)}</div>
      <div style="margin:2px 0"><b>Équipe:</b> ${escapeHtml(r.team)}</div>
      <div style="margin:4px 0"><b>Batterie:</b> ${formatBattery(r.battery)}
        <div style="background:#E2E8F0;border-radius:4px;height:4px;margin-top:2px">
          <div style="width:${batteryPct}%;height:100%;background:${battColor};border-radius:4px"></div>
        </div>
      </div>
      <div style="margin:2px 0"><b>Signal:</b> ${formatSignal(r.signalStrength)}</div>
      <div style="margin:2px 0"><b>Statut:</b> <span style="color:${statusColor};font-weight:600">${statusLabel}</span></div>
      <div style="margin:2px 0;color:#64748B">Mis à jour: ${formatTs(r.timestamp)}</div>
      ${r.outsideZone ? `<div style="margin-top:6px;padding:4px 6px;background:#FEE2E2;color:#991B1B;border-radius:4px">⚠ Hors zone</div>` : ""}
    </div>
  `;
}
