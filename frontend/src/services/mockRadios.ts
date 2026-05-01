import type { Radio } from "@/types/radio";

const NAMES = [
  "Nearly Tracker", "Falcon Beacon", "Sentinel One", "Coastal Watch", "Desert Echo",
  "Sahara Pulse", "Atlas Comm", "North Wind", "Silver Hawk", "Olive Branch",
  "Iron Owl", "Quiet River", "Bright Compass", "Deep Signal", "Cedar Relay",
  "Ranger Node", "Valley Scout", "Stone Beacon", "Desert Fox", "Patrol Mark",
];
const TEAMS = [
  "Team Gonzalez, Cole and Henry", "Team Bravo", "Team Sierra", "Team Lambda",
  "Équipe Nord", "Équipe Sud", "Équipe Côtière", "Équipe Mobile", "Équipe Alpha",
  "Équipe Delta", "Équipe Tango", "Équipe Foxtrot",
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function shortId(len = 22): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[randInt(0, alphabet.length - 1)];
  return s;
}
function serial(): string {
  const a = randInt(1000, 9999);
  const b = Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[randInt(0, 23)]).join("");
  const c = randInt(1000, 9999);
  return `RAD-${a}-${b}-${c}`;
}

export function generateMockRadios(count = 5000): Radio[] {
  const list: Radio[] = [];
  for (let i = 0; i < count; i++) {
    const active = Math.random() < 0.8;
    const isStolen = Math.random() < 0.03;
    const outsideZone = Math.random() < 0.15;
    list.push({
      radioId: shortId(22),
      serialNumber: serial(),
      name: `${NAMES[i % NAMES.length]} ${i + 1}`,
      team: TEAMS[i % TEAMS.length],
      isStolen,
      latitude: +rand(30, 37).toFixed(7),
      longitude: +rand(8, 13).toFixed(7),
      battery: +rand(10, 100).toFixed(2),
      signalStrength: randInt(-120, -50),
      active,
      outsideZone,
      timestamp: Math.floor(Date.now() / 1000) - randInt(0, 86400),
    });
  }
  return list;
}