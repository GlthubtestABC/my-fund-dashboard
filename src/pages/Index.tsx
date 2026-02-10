import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProfitDistributionChart from "@/components/dashboard/ProfitDistributionChart";
import TopBottomFunds from "@/components/dashboard/TopBottomFunds";
import { useFund } from "@/context/FundContext";
import { Wallet, TrendingUp, PiggyBank, BarChart3, CalendarDays, Calendar } from "lucide-react";

const Index = () => {
  const { holdings, totalAssets, totalFundValue, cashAvailable, monthlyProfit, yearlyProfit } = useFund();

  const todayProfit = holdings.reduce((s, f) => s + f.todayProfit, 0);
  const yesterdayProfit = holdings.reduce((s, f) => s + f.yesterdayProfit, 0);
  const totalCost = holdings.reduce((s, f) => s + f.buyAmount, 0);
  const totalProfit = holdings.reduce((s, f) => s + f.profit, 0);

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
        <StatCard title="累计收益" value={`${totalProfit > 0 ? "+" : ""}¥${totalProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle={totalCost > 0 ? `收益率 ${((totalProfit / totalCost) * 100).toFixed(2)}%` : "无持仓"}
          icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard title="月度收益（估）" value={`${monthlyProfit > 0 ? "+" : ""}¥${monthlyProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle="基于近期日收益推算" icon={<CalendarDays className="w-4 h-4" />} />
        <StatCard title="年度收益" value={`${yearlyProfit > 0 ? "+" : ""}¥${yearlyProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle="年内累计" icon={<Calendar className="w-4 h-4" />} />
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
