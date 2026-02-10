import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateNavHistory } from "@/data/mockData";
import { useFund } from "@/context/FundContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const Earnings = () => {
  const { holdings } = useFund();
  const [selectedFund, setSelectedFund] = useState(holdings[0]?.code || "");
  const fund = holdings.find((f) => f.code === selectedFund);

  const data = useMemo(() => {
    if (!fund) return [];
    const history = generateNavHistory(365);
    return history.map((d) => ({
      date: d.date,
      earnings: parseFloat((d.cumulativeReturn * fund.buyAmount / 100).toFixed(2)),
      earningsRate: d.cumulativeReturn,
    }));
  }, [selectedFund, fund]);

  if (!fund) return <DashboardLayout><p className="text-muted-foreground text-center py-20">暂无持仓基金</p></DashboardLayout>;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-xl">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <p className={`text-sm font-semibold font-mono-nums ${payload[0].value >= 0 ? "text-profit" : "text-loss"}`}>
            {payload[0].value >= 0 ? "+" : ""}¥{payload[0].value.toFixed(2)}
          </p>
          <p className={`text-xs font-mono-nums ${payload[0].payload.earningsRate >= 0 ? "text-profit" : "text-loss"}`}>
            {payload[0].payload.earningsRate >= 0 ? "+" : ""}{payload[0].payload.earningsRate.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">收益曲线</h1>
        <p className="text-sm text-muted-foreground mt-1">单基金持仓收益走势</p>
      </div>

      <div className="mb-4">
        <select
          value={selectedFund}
          onChange={(e) => setSelectedFund(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {holdings.map((f) => (
            <option key={f.code} value={f.code}>
              {f.name} ({f.code})
            </option>
          ))}
        </select>
      </div>

      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{fund.name}</h3>
            <p className="text-xs text-muted-foreground">持仓收益 · 成本 ¥{fund.buyAmount.toLocaleString()}</p>
          </div>
          <div className="text-right font-mono-nums">
            <p className={`text-lg font-bold ${fund.profit >= 0 ? "text-profit" : "text-loss"}`}>
              {fund.profit >= 0 ? "+" : ""}¥{fund.profit.toFixed(2)}
            </p>
            <p className={`text-xs ${fund.profitRate >= 0 ? "text-profit" : "text-loss"}`}>
              {fund.profitRate >= 0 ? "+" : ""}{fund.profitRate.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 70%, 44%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 70%, 44%)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <ReferenceLine y={0} stroke="hsl(215, 12%, 50%)" strokeDasharray="3 3" label={{ value: "盈亏线", fill: "hsl(215, 12%, 50%)", fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(160, 70%, 44%)"
                fill="url(#profitGrad)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(160, 70%, 44%)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;
