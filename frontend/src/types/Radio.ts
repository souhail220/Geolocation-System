export interface Radio {
  radioId: string;
  serialNumber: string;
  name: string;
  team: string;
  teamId?: number;
  isStolen: boolean;
  latitude: number;
  longitude: number;
  battery: number;
  signalStrength: number;
  active: boolean;
  outsideZone: boolean;
  timestamp: number;
}
