type MessageHandler = (data: unknown) => void;

let socket: WebSocket | null = null;
const handlers = new Set<MessageHandler>();

export function connect(url?: string): WebSocket | null {
  if (typeof window === "undefined") return null;
  const wsUrl = url ?? (import.meta as any).env?.VITE_WS_URL;
  if (!wsUrl) {
    console.warn("[socket] VITE_WS_URL not configured");
    return null;
  }
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }
  socket = new WebSocket(wsUrl);
  socket.addEventListener("message", (event) => {
    let payload: unknown = event.data;
    try {
      payload = JSON.parse(event.data);
    } catch {
      /* keep raw string */
    }
    handlers.forEach((h) => h(payload));
  });
  return socket;
}

export function disconnect(): void {
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function onMessage(cb: MessageHandler): () => void {
  handlers.add(cb);
  return () => handlers.delete(cb);
}

// ---- Realtime simulation (no backend yet) ----
import { useRadioStore } from "@/store/radioStore";

let simTimer: ReturnType<typeof setInterval> | null = null;
const flashHandlers = new Set<(radioId: string) => void>();

export function onRadioFlash(cb: (radioId: string) => void): () => void {
  flashHandlers.add(cb);
  return () => flashHandlers.delete(cb);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function startSimulation(intervalMs = 5000): void {
  if (typeof window === "undefined" || simTimer) return;
  simTimer = setInterval(() => {
    const { radios, updateRadioPosition } = useRadioStore.getState();
    if (!radios.length) return;
    const count = 30 + Math.floor(Math.random() * 21);
    const ts = Math.floor(Date.now() / 1000);
    for (let i = 0; i < count; i++) {
      const r = radios[Math.floor(Math.random() * radios.length)];
      const lat = +(r.latitude + (Math.random() - 0.5) * 0.002).toFixed(7);
      const lng = +(r.longitude + (Math.random() - 0.5) * 0.002).toFixed(7);
      const battery = +clamp(r.battery + (Math.random() - 0.5), 0, 100).toFixed(2);
      const signal = Math.round(clamp(r.signalStrength + (Math.random() - 0.5) * 4, -120, -50));
      updateRadioPosition(r.radioId, lat, lng, battery, signal, ts);
      flashHandlers.forEach((h) => h(r.radioId));
    }
  }, intervalMs);
}

export function stopSimulation(): void {
  if (simTimer) {
    clearInterval(simTimer);
    simTimer = null;
  }
}

export default { connect, disconnect, onMessage, startSimulation, stopSimulation, onRadioFlash };