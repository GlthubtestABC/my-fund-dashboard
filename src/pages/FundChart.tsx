import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { holdingFunds, generateNavHistory } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const periods = [
  { label: "1月", days: 30 },
  { label: "3月", days: 90 },
  { label: "6月", days: 180 },
  { label: "1年", days: 365 },
  { label: "成立以来", days: 730 },
];

const FundChart = () => {
  const [selectedFund, setSelectedFund] = useState(holdingFunds[0].code);
  const [periodIdx, setPeriodIdx] = useState(3);
  const [showCsi300, setShowCsi300] = useState(true);
  const [mode, setMode] = useState<"cumulative" | "annualized">("cumulative");

  const data = useMemo(() => {
    const history = generateNavHistory(periods[periodIdx].days);
    if (mode === "annualized") {
      const days = periods[periodIdx].days;
      return history.map((d) => ({
        ...d,
        cumulativeReturn: parseFloat(((Math.pow(1 + d.cumulativeReturn / 100, 365 / Math.max(1, days)) - 1) * 100).toFixed(2)),
        csi300Return: parseFloat(((Math.pow(1 + d.csi300Return / 100, 365 / Math.max(1, days)) - 1) * 100).toFixed(2)),
      }));
    }
    return history;
  }, [selectedFund, periodIdx, mode]);

  const fund = holdingFunds.find((f) => f.code === selectedFund)!;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-xl">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-muted-foreground">{p.name}:</span>
              <span className="text-sm font-semibold font-mono-nums" style={{ color: p.color }}>
                {p.value > 0 ? "+" : ""}{p.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">基金涨幅曲线</h1>
        <p className="text-sm text-muted-foreground mt-1">查看单只基金的历史表现</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedFund}
          onChange={(e) => setSelectedFund(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {holdingFunds.map((f) => (
            <option key={f.code} value={f.code}>
              {f.name} ({f.code})
            </option>
          ))}
        </select>

        <div className="flex bg-secondary rounded-lg p-0.5">
          {periods.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setPeriodIdx(i)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                periodIdx === i ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setMode("cumulative")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "cumulative" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
            }`}
          >
            累计涨幅
          </button>
          <button
            onClick={() => setMode("annualized")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "annualized" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"
            }`}
          >
            年化涨幅
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showCsi300}
            onChange={(e) => setShowCsi300(e.target.checked)}
            className="rounded border-border"
          />
          对比沪深300
        </label>
      </div>

      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">{fund.name}</h3>
          <p className="text-xs text-muted-foreground">{fund.code} · {fund.type}</p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(220, 14%, 16%)" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis
                tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "hsl(220, 14%, 16%)" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(215, 12%, 50%)" }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeReturn"
                name={fund.name}
                stroke="hsl(160, 70%, 44%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(160, 70%, 44%)" }}
              />
              {showCsi300 && (
                <Line
                  type="monotone"
                  dataKey="csi300Return"
                  name="沪深300"
                  stroke="hsl(200, 80%, 55%)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(200, 80%, 55%)" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FundChart;
