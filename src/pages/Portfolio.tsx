import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { holdingFunds, Fund } from "@/data/mockData";
import { ArrowUpDown, Search, Filter } from "lucide-react";

type SortKey = "profit" | "profitRate" | "todayProfit" | "buyDate" | "buyAmount";
type SortDir = "asc" | "desc";

const Portfolio = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const types = useMemo(() => {
    const set = new Set(holdingFunds.map((f) => f.type));
    return ["all", ...Array.from(set)];
  }, []);

  const sorted = useMemo(() => {
    let filtered = holdingFunds.filter(
      (f) =>
        (typeFilter === "all" || f.type === typeFilter) &&
        (f.name.includes(search) || f.code.includes(search))
    );
    filtered.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "profit": av = a.profit; bv = b.profit; break;
        case "profitRate": av = a.profitRate; bv = b.profitRate; break;
        case "todayProfit": av = a.todayProfit; bv = b.todayProfit; break;
        case "buyDate": av = new Date(a.buyDate).getTime(); bv = new Date(b.buyDate).getTime(); break;
        case "buyAmount": av = a.buyAmount; bv = b.buyAmount; break;
        default: av = 0; bv = 0;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return filtered;
  }, [search, sortKey, sortDir, typeFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className={`flex items-center gap-1 text-xs uppercase tracking-wider font-medium transition-colors ${
        sortKey === sortKeyName ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  const formatMoney = (v: number, showSign = false) => {
    const sign = showSign && v > 0 ? "+" : "";
    return `${sign}¥${v.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  };

  const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">持仓管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理已买入的基金持仓</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索基金名称或代码..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {t === "all" ? "全部" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="card-gradient rounded-xl border border-border overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">基金</th>
                <th className="text-right px-4 py-3"><SortHeader label="买入金额" sortKeyName="buyAmount" /></th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">当前市值</th>
                <th className="text-right px-4 py-3"><SortHeader label="持仓收益" sortKeyName="profit" /></th>
                <th className="text-right px-4 py-3"><SortHeader label="收益率" sortKeyName="profitRate" /></th>
                <th className="text-right px-4 py-3"><SortHeader label="今日收益" sortKeyName="todayProfit" /></th>
                <th className="text-right px-4 py-3"><SortHeader label="买入时间" sortKeyName="buyDate" /></th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((fund) => (
                <tr key={fund.code} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{fund.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{fund.code}</span>
                        {fund.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm text-foreground">
                    {formatMoney(fund.buyAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm text-foreground">
                    {formatMoney(fund.currentValue)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${fund.profit > 0 ? "text-profit" : "text-loss"}`}>
                    {formatMoney(fund.profit, true)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${fund.profitRate > 0 ? "text-profit" : "text-loss"}`}>
                    {formatPercent(fund.profitRate)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm ${fund.todayProfit > 0 ? "text-profit" : "text-loss"}`}>
                    {formatMoney(fund.todayProfit, true)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {fund.buyDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px] truncate">
                    {fund.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Portfolio;
