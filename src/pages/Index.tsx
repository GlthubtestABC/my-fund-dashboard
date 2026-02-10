import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ProfitDistributionChart from "@/components/dashboard/ProfitDistributionChart";
import TopBottomFunds from "@/components/dashboard/TopBottomFunds";
import { getTodayOverview } from "@/data/mockData";
import { Wallet, TrendingUp, PiggyBank, BarChart3 } from "lucide-react";

const Index = () => {
  const overview = getTodayOverview();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">今日总览</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="今日收益"
          value={`${overview.todayProfit > 0 ? "+" : ""}¥${overview.todayProfit.toFixed(2)}`}
          subtitle={`收益率 ${overview.todayRate > 0 ? "+" : ""}${overview.todayRate.toFixed(4)}%`}
          change={overview.profitDiff}
          changeLabel="vs 昨日"
          icon={<TrendingUp className="w-4 h-4" />}
          className={overview.todayProfit > 0 ? "glow-profit" : "glow-loss"}
        />
        <StatCard
          title="总资产"
          value={`¥${overview.totalValue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle={`持仓 ${overview.fundCount} 只基金`}
          icon={<Wallet className="w-4 h-4" />}
        />
        <StatCard
          title="累计收益"
          value={`${overview.totalProfit > 0 ? "+" : ""}¥${overview.totalProfit.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle={`收益率 ${overview.totalProfitRate > 0 ? "+" : ""}${overview.totalProfitRate.toFixed(2)}%`}
          icon={<PiggyBank className="w-4 h-4" />}
        />
        <StatCard
          title="总投入"
          value={`¥${overview.totalCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`}
          subtitle="累计买入本金"
          icon={<BarChart3 className="w-4 h-4" />}
        />
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
