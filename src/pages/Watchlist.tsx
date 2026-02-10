import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFund } from "@/context/FundContext";
import MiniSparkline from "@/components/dashboard/MiniSparkline";
import { Eye, Tag, Bell, Trash2, Plus, TrendingUp, TrendingDown, Shield, BarChart3, Users, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const riskColors: Record<string, string> = {
  "低": "text-[hsl(210,70%,55%)] bg-[hsl(210,70%,55%)]/10",
  "中低": "text-[hsl(180,60%,45%)] bg-[hsl(180,60%,45%)]/10",
  "中": "text-warning bg-warning/10",
  "中高": "text-[hsl(20,80%,55%)] bg-[hsl(20,80%,55%)]/10",
  "高": "text-loss bg-loss/10",
};

const Watchlist = () => {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useFund();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const allTags = Array.from(new Set(watchlist.flatMap((f) => f.tags)));

  const filtered = selectedTags.length
    ? watchlist.filter((f) => f.tags.some((t) => selectedTags.includes(t)))
    : watchlist;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const formatPercent = (v: number | undefined) => {
    if (v === undefined || v === null || isNaN(v)) return "--";
    return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
  };
  const pColor = (v: number | undefined) => !v ? "text-muted-foreground" : v > 0 ? "text-profit" : v < 0 ? "text-loss" : "text-muted-foreground";

  const handleAdd = () => {
    const code = newCode.trim();
    if (!code) { toast({ title: "请输入基金代码", variant: "destructive" }); return; }
    if (watchlist.find((f) => f.code === code)) { toast({ title: "该基金已在关注列表中", variant: "destructive" }); return; }
    addToWatchlist(code, newName.trim());
    toast({ title: "添加成功", description: `${newName.trim() || code} 已加入关注池` });
    setNewCode("");
    setNewName("");
  };

  const handleRemove = (code: string, name: string) => {
    removeFromWatchlist(code);
    toast({ title: "已移除", description: `${name} 已从关注池移除` });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">关注基金池</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">追踪感兴趣的基金表现 · 共关注 {watchlist.length} 只</p>
      </div>

      {/* Add fund form */}
      <div className="card-gradient rounded-xl border border-border p-4 mb-4 animate-slide-up">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block">基金代码</label>
            <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="如 110011"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block">基金名称（可选）</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="基金名称"
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <button onClick={handleAdd} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />添加关注
          </button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Tag className="w-4 h-4 text-muted-foreground mt-1" />
          {allTags.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((fund) => {
          const sparkColor = fund.change1m >= 0 ? "hsl(0, 85%, 55%)" : "hsl(140, 60%, 38%)";
          const riskStyle = riskColors[fund.riskLevel] || "text-muted-foreground bg-muted";
          return (
            <div key={fund.code} className="card-gradient rounded-xl border border-border hover:border-primary/30 transition-all animate-slide-up group overflow-hidden">
              {/* Header row */}
              <div className="flex items-start justify-between p-5 pb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-foreground truncate">{fund.name}</h3>
                    <span className="text-xs text-muted-foreground font-mono-nums">{fund.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${riskStyle}`}>
                      {fund.riskLevel}风险
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{fund.type}</span>
                    {fund.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold font-mono-nums text-foreground">{(fund.currentNav ?? 0).toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      {(fund.change1d ?? 0) >= 0 ? <TrendingUp className="w-3 h-3 text-profit" /> : <TrendingDown className="w-3 h-3 text-loss" />}
                      <span className={`text-sm font-bold font-mono-nums ${pColor(fund.change1d)}`}>{formatPercent(fund.change1d)}</span>
                      <span className="text-[10px] text-muted-foreground ml-0.5">今日</span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(fund.code, fund.name)}
                    className="p-1.5 rounded-md hover:bg-loss-muted text-muted-foreground hover:text-loss transition-colors opacity-0 group-hover:opacity-100" title="移除关注">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="px-5 py-1">
                {fund.navHistory && fund.navHistory.length > 0 ? (
                  <MiniSparkline data={fund.navHistory} color={sparkColor} height={56} />
                ) : (
                  <div className="h-[56px] flex items-center justify-center text-xs text-muted-foreground">暂无走势数据</div>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">近30日净值走势</p>
              </div>

              {/* Performance metrics row */}
              <div className="grid grid-cols-7 gap-0 mx-5 mt-2 rounded-lg bg-muted/50 overflow-hidden">
                {[
                  { label: "近1周", value: fund.change1w },
                  { label: "近1月", value: fund.change1m },
                  { label: "近3月", value: fund.change3m },
                  { label: "近6月", value: fund.change6m },
                  { label: "近1年", value: fund.change1y },
                  { label: "今年来", value: fund.changeYtd },
                  { label: "成立来", value: (fund.change1y ?? 0) * 1.5 },
                ].map((item, idx) => (
                  <div key={idx} className="text-center py-2.5 border-r border-border/30 last:border-r-0">
                    <p className="text-[10px] text-muted-foreground mb-0.5">{item.label}</p>
                    <p className={`text-xs font-bold font-mono-nums ${pColor(item.value)}`}>{formatPercent(item.value)}</p>
                  </div>
                ))}
              </div>

              {/* Bottom info row */}
              <div className="flex items-center justify-between px-5 py-3 mt-2 border-t border-border/30">
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    夏普 <span className="text-foreground font-semibold font-mono-nums">{(fund.sharpeRatio ?? 0).toFixed(2)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    最大回撤 <span className="text-loss font-semibold font-mono-nums">{(fund.maxDrawdown ?? 0).toFixed(1)}%</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    规模 <span className="text-foreground font-semibold font-mono-nums">{fund.fundSize}亿</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-foreground font-semibold">{fund.fundManager}</span>
                  </span>
                </div>

                {(fund.alertNavBelow || fund.alertGainAbove) && (
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3 h-3 text-warning" />
                    <span className="text-[10px] text-warning">
                      {fund.alertNavBelow && `≤${fund.alertNavBelow} 买入`}
                      {fund.alertNavBelow && fund.alertGainAbove && " · "}
                      {fund.alertGainAbove && `≥${fund.alertGainAbove}% 关注`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无关注基金，请在上方输入基金代码添加</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;