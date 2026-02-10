import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

const MiniSparkline = ({ data, color = "hsl(0, 85%, 55%)", height = 40 }: MiniSparklineProps) => {
  const chartData = useMemo(() => data.map((v, i) => ({ i, v })), [data]);
  const isPositive = data.length > 1 && data[data.length - 1] >= data[0];
  const lineColor = color || (isPositive ? "hsl(0, 85%, 55%)" : "hsl(140, 60%, 38%)");

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={lineColor} strokeWidth={1.5}
            fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, "")})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniSparkline;
