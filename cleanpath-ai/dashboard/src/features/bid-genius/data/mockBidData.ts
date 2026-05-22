export interface BidDataPoint {
  time: string;
  market: number;
  bid: number;
}

function generateData(count: number, timeFormat: (i: number) => string): BidDataPoint[] {
  const data: BidDataPoint[] = [];
  let baseMarket = 4.5;
  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * 1.2;
    baseMarket = Math.max(2.5, Math.min(7, baseMarket + noise * 0.3));
    const market = parseFloat(baseMarket.toFixed(2));
    const discount = 0.08 + Math.random() * 0.2;
    const bid = parseFloat((market * (1 - discount)).toFixed(2));
    data.push({ time: timeFormat(i), market, bid });
  }
  return data;
}

export const data1H = generateData(12, (i) => {
  const h = 10;
  const m = i * 5;
  return `${h}:${m.toString().padStart(2, "0")}`;
});

export const data24H = generateData(24, (i) => `${i.toString().padStart(2, "0")}:00`);

export const data7D = generateData(7, (i) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days[i];
});

export function getStats(data: BidDataPoint[]) {
  let totalSavings = 0;
  let totalDiscount = 0;
  data.forEach((d) => {
    totalSavings += d.market - d.bid;
    totalDiscount += (d.market - d.bid) / d.market;
  });
  return {
    totalSavings: parseFloat(totalSavings.toFixed(2)),
    avgDiscount: parseFloat(((totalDiscount / data.length) * 100).toFixed(1)),
    winRate: 78,
  };
}
