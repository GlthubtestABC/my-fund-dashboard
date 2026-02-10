import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { watchFunds } from "@/data/mockData";
import { Eye, Tag, Bell } from "lucide-react";

const Watchlist = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(new Set(watchFunds.flatMap((f) => f.tags)));

  const filtered = selectedTags.length
    ? watchFunds.filter((f) => f.tags.some((t) => selectedTags.includes(t)))
    : watchFunds;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">关注基金池</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">追踪感兴趣的基金表现</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Tag className="w-4 h-4 text-muted-foreground mt-1" />
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTags.includes(tag)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((fund) => (
          <div
            key={fund.code}
            className="card-gradient rounded-xl border border-border p-4 hover:border-primary/30 transition-all animate-slide-up"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{fund.name}</h3>
                  <span className="text-xs text-muted-foreground">{fund.code}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {fund.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono-nums text-foreground">{fund.currentNav.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">最新净值</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">近1月</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change1m > 0 ? "text-profit" : "text-loss"}`}>
                  {formatPercent(fund.change1m)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">近3月</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change3m > 0 ? "text-profit" : "text-loss"}`}>
                  {formatPercent(fund.change3m)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">近1年</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change1y > 0 ? "text-profit" : "text-loss"}`}>
                  {formatPercent(fund.change1y)}
                </p>
              </div>
            </div>

            {(fund.alertNavBelow || fund.alertGainAbove) && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <Bell className="w-3 h-3 text-warning" />
                <span className="text-xs text-warning">
                  {fund.alertNavBelow && `净值跌至 ${fund.alertNavBelow} 提醒买入`}
                  {fund.alertNavBelow && fund.alertGainAbove && " · "}
                  {fund.alertGainAbove && `涨幅达 ${fund.alertGainAbove}% 提醒关注`}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
