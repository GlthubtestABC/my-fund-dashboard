import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateTotalReturnHistory } from "@/data/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fadeUp, slideInLeft, scaleIn } from "@/lib/motion";

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
      <motion.div variants={slideInLeft} initial="hidden" animate="visible" className="mb-6">
        <h1 className="text-xl font-bold text-foreground">总收益曲线</h1>
        <p className="text-sm text-muted-foreground mt-1">全部持仓的累计收益走势</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={0}
          className="card-gradient rounded-xl border border-border p-5 relative corner-accent shimmer-effect border-glow">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">累计总收益</p>
          <p className={`text-2xl font-bold font-mono-nums glow-text ${latestProfit >= 0 ? "text-profit" : "text-loss"}`}>
            {latestProfit >= 0 ? "+" : ""}¥{latestProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
        <motion.div variants={scaleIn} initial="hidden" animate="visible" custom={1}
          className="card-gradient rounded-xl border border-border p-5 relative corner-accent shimmer-effect border-glow">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">累计收益率</p>
          <p className={`text-2xl font-bold font-mono-nums glow-text ${latestRate >= 0 ? "text-profit" : "text-loss"}`}>
            {latestRate >= 0 ? "+" : ""}{latestRate.toFixed(2)}%
          </p>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group">
          <input type="checkbox" checked={showCsi300} onChange={(e) => setShowCsi300(e.target.checked)}
            className="rounded border-border accent-primary" />
          <span className="group-hover:text-foreground transition-colors">对比沪深300</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer group">
          <input type="checkbox" checked={showDeposit} onChange={(e) => setShowDeposit(e.target.checked)}
            className="rounded border-border accent-primary" />
          <span className="group-hover:text-foreground transition-colors">对比存款利率</span>
        </label>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
        className="card-gradient rounded-xl border border-border p-5 relative corner-accent border-glow">
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 10%, 13%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(220, 8%, 45%)", fontSize: 11 }} tickLine={false}
                axisLine={{ stroke: "hsl(228, 10%, 13%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "hsl(220, 8%, 45%)", fontSize: 11 }} tickLine={false}
                axisLine={{ stroke: "hsl(228, 10%, 13%)" }} tickFormatter={(v) => `¥${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(220, 8%, 45%)" }} />
              <Line type="monotone" dataKey="totalProfit" name="累计收益" stroke="hsl(0, 85%, 55%)"
                strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              {showCsi300 && (
                <Line type="monotone" dataKey="csi300" name="沪深300" stroke="hsl(210, 70%, 55%)"
                  strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              )}
              {showDeposit && (
                <Line type="monotone" dataKey="depositRate" name="存款基准利率" stroke="hsl(35, 95%, 55%)"
                  strokeWidth={1} strokeDasharray="2 2" dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TotalReturns;