import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFund } from "@/context/FundContext";
import { Eye, Tag, Bell, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

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

      <div className="grid gap-3">
        {filtered.map((fund) => (
          <div key={fund.code} className="card-gradient rounded-xl border border-border p-4 hover:border-primary/30 transition-all animate-slide-up group">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{fund.name}</h3>
                  <span className="text-xs text-muted-foreground">{fund.code}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {fund.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <p className="text-lg font-bold font-mono-nums text-foreground">{fund.currentNav.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground">最新净值</p>
                </div>
                <button onClick={() => handleRemove(fund.code, fund.name)}
                  className="p-1.5 rounded-md hover:bg-loss-muted text-muted-foreground hover:text-loss transition-colors opacity-0 group-hover:opacity-100" title="移除关注">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground">近1月</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change1m > 0 ? "text-profit" : "text-loss"}`}>{formatPercent(fund.change1m)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">近3月</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change3m > 0 ? "text-profit" : "text-loss"}`}>{formatPercent(fund.change3m)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">近1年</p>
                <p className={`text-sm font-semibold font-mono-nums ${fund.change1y > 0 ? "text-profit" : "text-loss"}`}>{formatPercent(fund.change1y)}</p>
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
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">暂无关注基金，请在上方输入基金代码添加</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Watchlist;
