import { Radio } from "@/types/Radio.ts";

export function radioStatus(r: Radio): "active" | "inactive" | "stolen" {
  if (r.isStolen) return "stolen";
  return r.active ? "active" : "inactive";
}

export function batteryColor(pct: number): string {
  if (pct > 50) return "#059669";
  if (pct >= 20) return "#D97706";
  return "#DC2626";
}

export function formatTs(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );
}

export function buildPopupHtml(r: Radio): string {
  const status = radioStatus(r);
  const statusLabel =
    status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "Volé";
  const statusColor =
    status === "active" ? "#059669" : status === "inactive" ? "#D97706" : "#DC2626";
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
