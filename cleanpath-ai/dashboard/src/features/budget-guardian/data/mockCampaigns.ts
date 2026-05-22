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
}

export const mockCampaigns: Campaign[] = [
  {
    id: "CMP-7291",
    name: "Summer Brand Awareness Q3",
    status: true,
    total_budget: 50000,
    spend: 18750,
    committed: 6200,
    daily_cap: 2500,
    pacing_health: "healthy",
    pacing_mode: "SMOOTH",
    flight_start: "2026-02-01",
    flight_end: "2026-03-15",
    velocity: 0.87,
    spend_history: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      spend: Math.round(780 + i * 42 + Math.random() * 80),
      target: Math.round(800 + i * 45),
    })),
  },
  {
    id: "CMP-4518",
    name: "Retargeting — Cart Abandoners",
    status: true,
    total_budget: 12000,
    spend: 9800,
    committed: 1500,
    daily_cap: 800,
    pacing_health: "accelerated",
    pacing_mode: "ASAP",
    flight_start: "2026-01-20",
    flight_end: "2026-02-28",
    velocity: 1.42,
    spend_history: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      spend: Math.round(400 + i * 38 + Math.random() * 120),
      target: Math.round(380 + i * 32),
    })),
  },
  {
    id: "CMP-6034",
    name: "Product Launch — Series X",
    status: true,
    total_budget: 75000,
    spend: 12300,
    committed: 8900,
    daily_cap: 5000,
    pacing_health: "stalled",
    pacing_mode: "SMOOTH",
    flight_start: "2026-02-10",
    flight_end: "2026-04-01",
    velocity: 0.23,
    spend_history: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      spend: Math.round(500 + i * 18 + Math.random() * 40),
      target: Math.round(600 + i * 35),
    })),
  },
  {
    id: "CMP-8892",
    name: "Holiday Performance Max",
    status: false,
    total_budget: 25000,
    spend: 25000,
    committed: 0,
    daily_cap: 1500,
    pacing_health: "healthy",
    pacing_mode: "SMOOTH",
    flight_start: "2025-12-01",
    flight_end: "2026-01-05",
    velocity: 0,
    spend_history: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      spend: Math.round(1000 + i * 42),
      target: Math.round(1000 + i * 42),
    })),
  },
  {
    id: "CMP-3310",
    name: "Lookalike — High-Value Users",
    status: true,
    total_budget: 8000,
    spend: 3200,
    committed: 1800,
    daily_cap: 600,
    pacing_health: "healthy",
    pacing_mode: "ASAP",
    flight_start: "2026-02-05",
    flight_end: "2026-03-05",
    velocity: 0.55,
    spend_history: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      spend: Math.round(130 + i * 12 + Math.random() * 30),
      target: Math.round(140 + i * 13),
    })),
  },
];
