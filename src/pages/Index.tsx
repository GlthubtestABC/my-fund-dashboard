import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProfitDistributionChart from "@/components/dashboard/ProfitDistributionChart";
import TopBottomFunds from "@/components/dashboard/TopBottomFunds";
import { useFund } from "@/context/FundContext";
import { Wallet, TrendingUp, PiggyBank, BarChart3, CalendarDays, Calendar, Clock, Percent } from "lucide-react";

const Index = () => {
  const { holdings, totalAssets, totalFundValue, cashAvailable, monthlyProfit, yearlyProfit } = useFund();

  const todayProfit = holdings.reduce((s, f) => s + f.todayProfit, 0);
  const yesterdayProfit = holdings.reduce((s, f) => s + f.yesterdayProfit, 0);
  const totalCost = holdings.reduce((s, f) => s + f.buyAmount, 0);
  const totalProfit = holdings.reduce((s, f) => s + f.profit, 0);

  // 昨日收益率
  const yesterdayRate = totalCost > 0 ? (yesterdayProfit / totalCost) * 100 : 0;

  // 最近7日年化收益率: 7日总收益率 * (365/7)
  const avg7dDailyProfit = (todayProfit + yesterdayProfit) / 2; // 简化：用今日+昨日均值模拟
  const weekly7dReturn = totalCost > 0 ? (avg7dDailyProfit * 7 / totalCost) * 100 : 0;
  const annualized7d = weekly7dReturn * (365 / 7);

  // 年度收益率
  const yearlyRate = totalCost > 0 ? (yearlyProfit / totalCost) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">今日总览</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="今日收益"
          value={`${todayProfit > 0 ? "+" : ""}¥${todayProfit.toFixed(2)}`}
          subtitle={`收益率 ${totalCost > 0 ? ((todayProfit / totalCost) * 100).toFixed(4) : "0"}%`}
          change={todayProfit - yesterdayProfit}
          changeLabel="vs 昨日"
          icon={<TrendingUp className="w-4 h-4" />}
          className={todayProfit > 0 ? "glow-profit" : "glow-loss"}
        />
        <StatCard title="总资产额度" value={`¥${totalAssets.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle={`可用 ¥${cashAvailable.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          icon={<Wallet className="w-4 h-4" />} />
        <StatCard title="持仓市值" value={`¥${totalFundValue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle={`持仓 ${holdings.length} 只 · 仓位 ${((totalFundValue / totalAssets) * 100).toFixed(1)}%`}
          icon={<PiggyBank className="w-4 h-4" />} />
        <StatCard title="昨日收益率"
          value={`${yesterdayRate > 0 ? "+" : ""}${yesterdayRate.toFixed(4)}%`}
          subtitle={`昨日收益 ${yesterdayProfit > 0 ? "+" : ""}¥${yesterdayProfit.toFixed(2)}`}
          icon={<Clock className="w-4 h-4" />} />
        <StatCard title="近7日年化"
          value={`${annualized7d > 0 ? "+" : ""}${annualized7d.toFixed(2)}%`}
          subtitle="最近7日收益年化"
          icon={<Percent className="w-4 h-4" />}
          className={annualized7d > 0 ? "glow-profit" : annualized7d < 0 ? "glow-loss" : ""} />
        <StatCard title="年度收益率"
          value={`${yearlyRate > 0 ? "+" : ""}${yearlyRate.toFixed(2)}%`}
          subtitle={`年度收益 ${yearlyProfit > 0 ? "+" : ""}¥${yearlyProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          icon={<Calendar className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1">
          <ProfitDistributionChart />
        </div>
        <div className="lg:col-span-2">
          <TopBottomFunds />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
