import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface SpendChartProps {
  data: { hour: number; spend: number; target: number }[];
}

const SpendChart = ({ data }: SpendChartProps) => (
  <div className="w-full h-52">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(217, 33%, 20%)"
          vertical={false}
        />
        <XAxis
          dataKey="hour"
          tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
          axisLine={{ stroke: "hsl(217, 33%, 20%)" }}
          tickLine={false}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis
          tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(217, 33%, 14%)",
            border: "1px solid hsl(217, 33%, 24%)",
            borderRadius: "8px",
            color: "hsl(210, 40%, 98%)",
            fontSize: "12px",
          }}
          formatter={(value: number) => [`$${value}`, undefined]}
          labelFormatter={(l) => `Hour ${l}`}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="hsl(215, 20%, 45%)"
          strokeDasharray="6 4"
          strokeWidth={2}
          dot={false}
          name="Target"
        />
        <Line
          type="monotone"
          dataKey="spend"
          stroke="hsl(160, 84%, 39%)"
          strokeWidth={2.5}
          dot={false}
          name="Spend"
          className="glow-line"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default SpendChart;
