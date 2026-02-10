import { ArrowUp, ArrowDown } from "lucide-react";
import { useFund } from "@/context/FundContext";

const TopBottomFunds = () => {
  const { holdings } = useFund();
  const sorted = [...holdings].sort((a, b) => b.todayProfit - a.todayProfit);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const FundRow = ({ fund, rank }: { fund: typeof top3[0]; rank: number }) => {
    const isPositive = fund.todayProfit > 0;
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="text-xs text-muted-foreground w-4 font-medium">#{rank}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fund.name}</p>
          <p className="text-xs text-muted-foreground">{fund.code}</p>
        </div>
        <div className="text-right font-mono-nums">
          <p className={`text-sm font-semibold ${isPositive ? "text-profit" : "text-loss"}`}>
            {isPositive ? "+" : ""}¥{fund.todayProfit.toFixed(2)}
          </p>
          <p className={`text-xs ${isPositive ? "text-profit" : "text-loss"}`}>
            {isPositive ? "+" : ""}{fund.todayProfitRate.toFixed(2)}%
          </p>
        </div>
      </div>
    );
  };

  if (holdings.length === 0) {
    return <div className="card-gradient rounded-xl border border-border p-5 text-center text-sm text-muted-foreground py-12">暂无持仓数据</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUp className="w-4 h-4 text-profit" />
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">收益 TOP 3</h3>
        </div>
        <div className="divide-y divide-border">
          {top3.map((fund, i) => (<FundRow key={fund.code} fund={fund} rank={i + 1} />))}
        </div>
      </div>
      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <ArrowDown className="w-4 h-4 text-loss" />
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">亏损 TOP 3</h3>
        </div>
        <div className="divide-y divide-border">
          {bottom3.map((fund, i) => (<FundRow key={fund.code} fund={fund} rank={i + 1} />))}
        </div>
      </div>
    </div>
  );
};

export default TopBottomFunds;
