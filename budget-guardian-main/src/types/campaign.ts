export interface Campaign {
  id: string;
  name: string;
  status: boolean;
  total_budget: number;
  spend: number;
  committed: number;
  daily_cap: number;
  pacing_health: "healthy" | "accelerated" | "stalled";
  pacing_mode: "ASAP" | "SMOOTH";
  flight_start: string;
  flight_end: string;
  velocity: number; // $/sec
  spend_history: { hour: number; spend: number; target: number }[];
  working_media_percent?: number;
  waste_recovered?: number;
}
