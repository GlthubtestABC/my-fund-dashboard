import { useFund } from "@/context/FundContext";

const AssetAllocationBar = () => {
  const { holdings, totalAssets } = useFund();

  const typeMap: Record<string, { amount: number; color: string }> = {};
  const colorMap: Record<string, string> = {
    "混合型": "hsl(35, 95%, 55%)",
    "指数型": "hsl(210, 70%, 55%)",
    "股票型": "hsl(0, 85%, 55%)",
    "债券型": "hsl(180, 60%, 45%)",
    "未知": "hsl(280, 55%, 55%)",
  };

  holdings.forEach((f) => {
    if (!typeMap[f.type]) typeMap[f.type] = { amount: 0, color: colorMap[f.type] || "hsl(215, 12%, 50%)" };
    typeMap[f.type].amount += f.currentValue;
  });

  const totalInvested = holdings.reduce((s, f) => s + f.currentValue, 0);
  const cashAmount = totalAssets - holdings.reduce((s, f) => s + f.buyAmount, 0);
  const segments = Object.entries(typeMap).map(([type, { amount, color }]) => ({
    type, percent: (amount / totalAssets) * 100, amount, color,
  }));
  const cashPercent = Math.max(0, (cashAmount / totalAssets) * 100);

  return (
    <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">资产配置</h3>

      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-muted mb-4">
        {segments.map((seg) => (
          <div key={seg.type} style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
            className="transition-all duration-500" title={`${seg.type} ${seg.percent.toFixed(1)}%`} />
        ))}
        {cashPercent > 0 && (
          <div style={{ width: `${cashPercent}%` }}
            className="bg-muted-foreground/20 transition-all duration-500" title={`现金 ${cashPercent.toFixed(1)}%`} />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((seg) => (
          <div key={seg.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-muted-foreground">{seg.type}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono-nums text-foreground font-medium">{seg.percent.toFixed(1)}%</span>
            </div>
          </div>
        ))}
        {cashPercent > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-muted-foreground/20" />
              <span className="text-xs text-muted-foreground">现金</span>
            </div>
            <span className="text-xs font-mono-nums text-foreground font-medium">{cashPercent.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAllocationBar;
