import { useFund } from "@/context/FundContext";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const HoldingsPreview = () => {
  const { holdings } = useFund();
  const navigate = useNavigate();

  const sorted = [...holdings].sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit)).slice(0, 5);

  const formatMoney = (v: number, sign = false) => `${sign && v > 0 ? "+" : ""}¥${Math.abs(v).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;

  if (holdings.length === 0) return null;

  return (
    <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">持仓概览</h3>
        <button onClick={() => navigate("/portfolio")} className="flex items-center gap-0.5 text-xs text-primary hover:underline">
          全部持仓 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {sorted.map((fund) => {
          const pct = fund.profitRate;
          const barWidth = Math.min(Math.abs(pct) * 3, 100);
          return (
            <div key={fund.code} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{fund.name}</span>
                  <span className="text-[10px] text-muted-foreground">{fund.code}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground font-mono-nums">{formatMoney(fund.currentValue)}</span>
                  <span className={`text-xs font-semibold font-mono-nums min-w-[60px] text-right ${pct >= 0 ? "text-profit" : "text-loss"}`}>
                    {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                  </span>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${pct >= 0 ? "bg-profit" : "bg-loss"}`}
                  style={{ width: `${barWidth}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HoldingsPreview;
