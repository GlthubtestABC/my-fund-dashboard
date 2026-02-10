import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFund } from "@/context/FundContext";
import { Fund } from "@/data/mockData";
import { ArrowUpDown, Search, Filter, Plus, Minus, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type SortKey = "profit" | "profitRate" | "todayProfit" | "buyDate" | "buyAmount";
type SortDir = "asc" | "desc";

const Portfolio = () => {
  const { holdings, buyFund, sellFund, cashAvailable } = useFund();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("profit");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Trade dialog state
  const [tradeDialog, setTradeDialog] = useState<{ open: boolean; type: "buy" | "sell"; fund?: Fund }>({ open: false, type: "buy" });
  const [tradeCode, setTradeCode] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeNav, setTradeNav] = useState("");
  const [tradeShares, setTradeShares] = useState("");
  const [tradeDate, setTradeDate] = useState<Date | undefined>(new Date());

  const types = useMemo(() => {
    const set = new Set(holdings.map((f) => f.type));
    return ["all", ...Array.from(set)];
  }, [holdings]);

  const sorted = useMemo(() => {
    let filtered = holdings.filter(
      (f) => (typeFilter === "all" || f.type === typeFilter) && (f.name.includes(search) || f.code.includes(search))
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
  }, [holdings, search, sortKey, sortDir, typeFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button onClick={() => toggleSort(sortKeyName)}
      className={`flex items-center gap-1 text-xs uppercase tracking-wider font-medium transition-colors ${sortKey === sortKeyName ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {label}<ArrowUpDown className="w-3 h-3" />
    </button>
  );

  const formatMoney = (v: number, showSign = false) => `${showSign && v > 0 ? "+" : ""}¥${v.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;
  const formatPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;

  const openBuyDialog = (fund?: Fund) => {
    setTradeDialog({ open: true, type: "buy", fund });
    setTradeCode(fund?.code || "");
    setTradeAmount("");
    setTradeNav(fund?.currentNav.toFixed(4) || "");
    setTradeDate(new Date());
  };

  const openSellDialog = (fund: Fund) => {
    setTradeDialog({ open: true, type: "sell", fund });
    setTradeCode(fund.code);
    setTradeShares("");
    setTradeNav(fund.currentNav.toFixed(4));
  };

  const handleTrade = () => {
    const nav = parseFloat(tradeNav);
    if (tradeDialog.type === "buy") {
      const amount = parseFloat(tradeAmount);
      if (!tradeCode.trim() || isNaN(amount) || amount <= 0) {
        toast({ title: "请填写完整信息", variant: "destructive" }); return;
      }
      if (amount > cashAvailable) {
        toast({ title: "可用资金不足", description: `当前可用 ¥${cashAvailable.toFixed(2)}`, variant: "destructive" }); return;
      }
      const effectiveNav = isNaN(nav) || nav <= 0 ? 1 : nav;
      const dateStr = tradeDate ? format(tradeDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
      buyFund(tradeCode.trim(), `基金${tradeCode.trim()}`, amount, effectiveNav);
      toast({ title: "买入成功", description: `${tradeCode} ¥${amount.toFixed(2)} · ${dateStr}` });
    } else {
      const shares = parseFloat(tradeShares);
      if (isNaN(shares) || shares <= 0 || isNaN(nav) || nav <= 0) {
        toast({ title: "请填写完整信息", variant: "destructive" }); return;
      }
      sellFund(tradeCode, shares, nav);
      toast({ title: "卖出成功", description: `${tradeDialog.fund?.name || tradeCode} ${shares.toFixed(2)} 份` });
    }
    setTradeDialog({ open: false, type: "buy" });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">持仓管理</h1>
          <p className="text-sm text-muted-foreground mt-1">管理已买入的基金持仓 · 可用资金 <span className="text-foreground font-mono-nums">¥{cashAvailable.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</span></p>
        </div>
        <button onClick={() => openBuyDialog()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-4 h-4" />买入基金
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="搜索基金名称或代码..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"}`}>
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
                <th className="text-center px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((fund) => (
                <tr key={fund.code} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{fund.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{fund.code}</span>
                      {fund.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm text-foreground">{formatMoney(fund.buyAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono-nums text-sm text-foreground">{formatMoney(fund.currentValue)}</td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${fund.profit > 0 ? "text-profit" : "text-loss"}`}>{formatMoney(fund.profit, true)}</td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm font-medium ${fund.profitRate > 0 ? "text-profit" : "text-loss"}`}>{formatPercent(fund.profitRate)}</td>
                  <td className={`px-4 py-3 text-right font-mono-nums text-sm ${fund.todayProfit > 0 ? "text-profit" : "text-loss"}`}>{formatMoney(fund.todayProfit, true)}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">{fund.buyDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openBuyDialog(fund)} className="p-1.5 rounded-md hover:bg-profit-muted text-profit transition-colors" title="加仓">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openSellDialog(fund)} className="p-1.5 rounded-md hover:bg-loss-muted text-loss transition-colors" title="卖出">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">暂无持仓基金</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Dialog */}
      <Dialog open={tradeDialog.open} onOpenChange={(open) => setTradeDialog((p) => ({ ...p, open }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {tradeDialog.type === "buy" ? "买入基金" : "卖出基金"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {tradeDialog.type === "buy" && !tradeDialog.fund && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">基金代码</label>
                <input value={tradeCode} onChange={(e) => setTradeCode(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="如 110011" />
              </div>
            )}
            {tradeDialog.fund && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium text-foreground">{tradeDialog.fund.name}</p>
                <p className="text-xs text-muted-foreground">{tradeDialog.fund.code}</p>
                {tradeDialog.type === "sell" && (
                  <p className="text-xs text-muted-foreground mt-1">持有份额：{tradeDialog.fund.buyShares.toFixed(2)} 份</p>
                )}
              </div>
            )}
            {tradeDialog.type === "buy" ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">买入金额（元）</label>
                  <input value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} type="number"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="如 10000" />
                  <p className="text-xs text-muted-foreground mt-1">可用资金：¥{cashAvailable.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">买入时间</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted border-border", !tradeDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tradeDate ? format(tradeDate, "yyyy-MM-dd") : <span>选择日期</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={tradeDate} onSelect={setTradeDate}
                        disabled={(date) => date > new Date()}
                        initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">卖出净值</label>
                  <input value={tradeNav} onChange={(e) => setTradeNav(e.target.value)} type="number" step="0.0001"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="净值" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">卖出份额</label>
                  <input value={tradeShares} onChange={(e) => setTradeShares(e.target.value)} type="number"
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="卖出份数" />
                  {tradeDialog.fund && (
                    <button onClick={() => setTradeShares(tradeDialog.fund!.buyShares.toFixed(2))} className="text-xs text-primary mt-1 hover:underline">全部卖出</button>
                  )}
                </div>
              </>
            )}
            <button onClick={handleTrade}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${tradeDialog.type === "buy" ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
              {tradeDialog.type === "buy" ? "确认买入" : "确认卖出"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Portfolio;
