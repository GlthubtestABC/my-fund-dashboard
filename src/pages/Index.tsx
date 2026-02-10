import { useMemo } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfitDistributionChart from "@/components/dashboard/ProfitDistributionChart";
import TopBottomFunds from "@/components/dashboard/TopBottomFunds";
import AssetAllocationBar from "@/components/dashboard/AssetAllocationBar";
import HoldingsPreview from "@/components/dashboard/HoldingsPreview";
import MiniSparkline from "@/components/dashboard/MiniSparkline";
import { useFund } from "@/context/FundContext";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUp, ArrowDown,
  Clock, Percent, Calendar, Activity, Zap,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
};

const Index = () => {
  const { holdings, totalAssets, totalFundValue, cashAvailable, yearlyProfit } = useFund();

  const todayProfit = holdings.reduce((s, f) => s + f.todayProfit, 0);
  const yesterdayProfit = holdings.reduce((s, f) => s + f.yesterdayProfit, 0);
  const totalCost = holdings.reduce((s, f) => s + f.buyAmount, 0);
  const totalProfit = holdings.reduce((s, f) => s + f.profit, 0);

  const todayRate = totalCost > 0 ? (todayProfit / totalCost) * 100 : 0;
  const yesterdayRate = totalCost > 0 ? (yesterdayProfit / totalCost) * 100 : 0;
  const avg7dDailyProfit = (todayProfit + yesterdayProfit) / 2;
  const weekly7dReturn = totalCost > 0 ? (avg7dDailyProfit * 7 / totalCost) * 100 : 0;
  const annualized7d = weekly7dReturn * (365 / 7);
  const yearlyRate = totalCost > 0 ? (yearlyProfit / totalCost) * 100 : 0;
  const positionRate = totalAssets > 0 ? (totalFundValue / totalAssets) * 100 : 0;
  const profitDiff = todayProfit - yesterdayProfit;

  const sparkData = useMemo(() => {
    const data: number[] = [];
    let v = 0;
    for (let i = 0; i < 30; i++) {
      v += (Math.random() - 0.45) * 200;
      data.push(v);
    }
    return data;
  }, []);

  const formatMoney = (v: number, sign = false) => {
    const prefix = sign ? (v >= 0 ? "+" : "") : "";
    return `${prefix}¥${v.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const dateStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <p className="text-sm text-muted-foreground mb-1 font-mono-nums">{dateStr}</p>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">今日总览</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-profit data-tick" />
          <span className="uppercase tracking-widest text-[10px]">LIVE · 交易中</span>
        </div>
      </motion.div>

      {/* ── Hero Section: Today's P&L ── */}
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        custom={0}
        className={`rounded-xl border p-6 mb-6 relative overflow-hidden shimmer-effect corner-accent ${todayProfit >= 0
          ? "border-profit/20 bg-gradient-to-br from-profit/[0.06] via-card to-card glow-profit"
          : "border-loss/20 bg-gradient-to-br from-loss/[0.06] via-card to-card glow-loss"
        }`}
      >
        {/* Scan line effect */}
        <div className="scan-line absolute inset-0 pointer-events-none" />

        {/* Background sparkline watermark */}
        <div className="absolute right-0 bottom-0 w-[55%] h-full opacity-15 pointer-events-none">
          <MiniSparkline data={sparkData} color={todayProfit >= 0 ? "hsl(0, 85%, 55%)" : "hsl(140, 60%, 38%)"} height={160} />
        </div>

        {/* Cyber grid overlay */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {todayProfit >= 0
                ? <TrendingUp className="w-5 h-5 text-profit" />
                : <TrendingDown className="w-5 h-5 text-loss" />
              }
            </motion.div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">今日收益</span>
          </div>

          <div className="flex items-end gap-4 mb-3">
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 120 }}
              className={`text-5xl font-extrabold font-mono-nums tracking-tighter glow-text ${todayProfit >= 0 ? "text-profit" : "text-loss"}`}
            >
              {formatMoney(todayProfit, true)}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className={`text-xl font-bold font-mono-nums mb-1.5 ${todayRate >= 0 ? "text-profit" : "text-loss"}`}
            >
              {todayRate >= 0 ? "+" : ""}{todayRate.toFixed(4)}%
            </motion.p>
          </div>

          {/* Metrics row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 flex-wrap"
          >
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${
              profitDiff >= 0 ? "bg-profit/10 text-profit border-profit/20" : "bg-loss/10 text-loss border-loss/20"
            }`}>
              {profitDiff >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span className="font-mono-nums">{formatMoney(Math.abs(profitDiff))}</span>
              <span className="text-muted-foreground ml-1">vs 昨日</span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span>昨日 <span className={`font-mono-nums font-semibold ${yesterdayProfit >= 0 ? "text-profit" : "text-loss"}`}>{formatMoney(yesterdayProfit, true)}</span></span>
            </div>
            <div className="text-xs text-muted-foreground">
              持仓 <span className="text-foreground font-semibold">{holdings.length}</span> 只
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Key Metrics Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* 总资产 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="card-gradient rounded-xl border border-border p-4 relative corner-accent border-glow hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">总资产额度</span>
          </div>
          <p className="text-lg font-bold font-mono-nums text-foreground">{formatMoney(totalAssets)}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">可用</span>
            <span className="text-[11px] font-mono-nums text-foreground">{formatMoney(cashAvailable)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${positionRate}%` }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-primary/60"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">仓位 {positionRate.toFixed(1)}%</p>
        </motion.div>

        {/* 持仓市值 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="card-gradient rounded-xl border border-border p-4 relative corner-accent border-glow hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">持仓市值</span>
          </div>
          <p className="text-lg font-bold font-mono-nums text-foreground">{formatMoney(totalFundValue)}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">累计收益</span>
            <span className={`text-[11px] font-mono-nums font-medium ${totalProfit >= 0 ? "text-profit" : "text-loss"}`}>
              {formatMoney(totalProfit, true)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-muted-foreground">累计收益率</span>
            <span className={`text-[11px] font-mono-nums font-medium ${totalProfit >= 0 ? "text-profit" : "text-loss"}`}>
              {totalCost > 0 ? `${((totalProfit / totalCost) * 100).toFixed(2)}%` : "0%"}
            </span>
          </div>
        </motion.div>

        {/* 收益率指标 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="card-gradient rounded-xl border border-border p-4 relative corner-accent border-glow hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">收益率</span>
          </div>
          <div className="space-y-2.5 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">昨日</span>
              </div>
              <span className={`text-sm font-bold font-mono-nums ${yesterdayRate >= 0 ? "text-profit" : "text-loss"}`}>
                {yesterdayRate >= 0 ? "+" : ""}{yesterdayRate.toFixed(4)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">近7日年化</span>
              </div>
              <span className={`text-sm font-bold font-mono-nums ${annualized7d >= 0 ? "text-profit" : "text-loss"}`}>
                {annualized7d >= 0 ? "+" : ""}{annualized7d.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">年度</span>
              </div>
              <span className={`text-sm font-bold font-mono-nums ${yearlyRate >= 0 ? "text-profit" : "text-loss"}`}>
                {yearlyRate >= 0 ? "+" : ""}{yearlyRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* 年度收益金额 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="card-gradient rounded-xl border border-border p-4 relative corner-accent border-glow hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">年度收益</span>
          </div>
          <p className={`text-lg font-bold font-mono-nums ${yearlyProfit >= 0 ? "text-profit" : "text-loss"}`}>
            {formatMoney(yearlyProfit, true)}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">昨日收益</span>
            <span className={`text-[11px] font-mono-nums font-medium ${yesterdayProfit >= 0 ? "text-profit" : "text-loss"}`}>
              {formatMoney(yesterdayProfit, true)}
            </span>
          </div>
          <div className="mt-2">
            <MiniSparkline data={sparkData} color={yearlyProfit >= 0 ? "hsl(0, 85%, 55%)" : "hsl(140, 60%, 38%)"} height={32} />
          </div>
        </motion.div>
      </div>

      {/* ── Charts & Rankings Row ── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={5}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6"
      >
        <div className="lg:col-span-4">
          <ProfitDistributionChart />
        </div>
        <div className="lg:col-span-8">
          <TopBottomFunds />
        </div>
      </motion.div>

      {/* ── Bottom Row: Allocation + Holdings ── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={6}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
      >
        <div className="lg:col-span-4">
          <AssetAllocationBar />
        </div>
        <div className="lg:col-span-8">
          <HoldingsPreview />
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;