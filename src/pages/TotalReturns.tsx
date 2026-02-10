import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateTotalReturnHistory } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TotalReturns = () => {
  const [showCsi300, setShowCsi300] = useState(true);
  const [showDeposit, setShowDeposit] = useState(true);

  const data = useMemo(() => generateTotalReturnHistory(365), []);

  const latestProfit = data[data.length - 1]?.totalProfit || 0;
  const latestRate = data[data.length - 1]?.totalRate || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-xl">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-muted-foreground">{p.name}:</span>
              <span className="text-sm font-semibold font-mono-nums" style={{ color: p.color }}>
                ¥{p.value.toFixed(2)}
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
        <h1 className="text-xl font-bold text-foreground">总收益曲线</h1>
        <p className="text-sm text-muted-foreground mt-1">全部持仓的累计收益走势</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card-gradient rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">累计总收益</p>
          <p className={`text-2xl font-bold font-mono-nums ${latestProfit >= 0 ? "text-profit" : "text-loss"}`}>
            {latestProfit >= 0 ? "+" : ""}¥{latestProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-gradient rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">累计收益率</p>
          <p className={`text-2xl font-bold font-mono-nums ${latestRate >= 0 ? "text-profit" : "text-loss"}`}>
            {latestRate >= 0 ? "+" : ""}{latestRate.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={showCsi300} onChange={(e) => setShowCsi300(e.target.checked)} className="rounded border-border" />
          对比沪深300
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={showDeposit} onChange={(e) => setShowDeposit(e.target.checked)} className="rounded border-border" />
          对比存款利率
        </label>
      </div>

      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="h-[450px]">
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
                tickFormatter={(v) => `¥${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(215, 12%, 50%)" }} />
              <Line
                type="monotone"
                dataKey="totalProfit"
                name="累计收益"
                stroke="hsl(0, 85%, 55%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {showCsi300 && (
                <Line
                  type="monotone"
                  dataKey="csi300"
                  name="沪深300"
                  stroke="hsl(200, 80%, 55%)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
              {showDeposit && (
                <Line
                  type="monotone"
                  dataKey="depositRate"
                  name="存款基准利率"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TotalReturns;
