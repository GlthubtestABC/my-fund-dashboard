import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Fund, WatchFund, holdingFunds as defaultHoldings, watchFunds as defaultWatch } from "@/data/mockData";

interface TradeRecord {
  id: string;
  fundCode: string;
  fundName: string;
  type: "buy" | "sell";
  amount: number;
  shares: number;
  nav: number;
  date: string;
}

interface FundContextType {
  totalAssets: number;
  setTotalAssets: (v: number) => void;
  holdings: Fund[];
  watchlist: WatchFund[];
  trades: TradeRecord[];
  addToWatchlist: (code: string, name: string) => void;
  removeFromWatchlist: (code: string) => void;
  buyFund: (code: string, name: string, amount: number, nav: number) => void;
  sellFund: (code: string, shares: number, nav: number) => void;
  cashAvailable: number;
  monthlyProfit: number;
  yearlyProfit: number;
  totalFundValue: number;
}

const FundContext = createContext<FundContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const patchWatchFund = (f: WatchFund): WatchFund => {
  if (f.navHistory && f.navHistory.length > 0) return f;
  const nav = f.currentNav || 1;
  const hist: number[] = [];
  let v = nav * 0.92;
  for (let i = 0; i < 30; i++) { v *= 1 + (Math.random() - 0.47) * 0.03; hist.push(parseFloat(v.toFixed(4))); }
  return {
    ...f,
    change1d: f.change1d ?? parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
    change1w: f.change1w ?? parseFloat(((Math.random() - 0.5) * 6).toFixed(2)),
    change6m: f.change6m ?? parseFloat(((Math.random() - 0.5) * 25).toFixed(2)),
    changeYtd: f.changeYtd ?? parseFloat(((Math.random() - 0.5) * 15).toFixed(2)),
    riskLevel: f.riskLevel ?? "中",
    sharpeRatio: f.sharpeRatio ?? parseFloat((Math.random() * 2).toFixed(2)),
    maxDrawdown: f.maxDrawdown ?? parseFloat((-(Math.random() * 40 + 5)).toFixed(1)),
    fundSize: f.fundSize ?? parseFloat((Math.random() * 300 + 20).toFixed(0)),
    fundManager: f.fundManager ?? "未知",
    navHistory: hist,
  };
};

export const FundProvider = ({ children }: { children: ReactNode }) => {
  const [totalAssets, setTotalAssetsState] = useState(() => loadFromStorage("fp_totalAssets", 500000));
  const [holdings, setHoldings] = useState<Fund[]>(() => loadFromStorage("fp_holdings", defaultHoldings));
  const [watchlist, setWatchlist] = useState<WatchFund[]>(() => loadFromStorage<WatchFund[]>("fp_watchlist", defaultWatch).map(patchWatchFund));
  const [trades, setTrades] = useState<TradeRecord[]>(() => loadFromStorage("fp_trades", []));

  useEffect(() => { localStorage.setItem("fp_totalAssets", JSON.stringify(totalAssets)); }, [totalAssets]);
  useEffect(() => { localStorage.setItem("fp_holdings", JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => { localStorage.setItem("fp_watchlist", JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem("fp_trades", JSON.stringify(trades)); }, [trades]);

  const totalFundValue = holdings.reduce((s, f) => s + f.currentValue, 0);
  const cashAvailable = totalAssets - holdings.reduce((s, f) => s + f.buyAmount, 0);

  // Mock monthly/yearly profit from holdings
  const monthlyProfit = holdings.reduce((s, f) => s + f.todayProfit * 22, 0);
  const yearlyProfit = holdings.reduce((s, f) => s + f.profit, 0);

  const setTotalAssets = useCallback((v: number) => {
    setTotalAssetsState(v);
  }, []);

  const addToWatchlist = useCallback((code: string, name: string) => {
    setWatchlist((prev) => {
      if (prev.find((f) => f.code === code)) return prev;
      const nav = 1.0 + Math.random();
      const genHist = () => {
        const d: number[] = [];
        let v = nav * 0.9;
        for (let i = 0; i < 30; i++) { v *= 1 + (Math.random() - 0.47) * 0.03; d.push(parseFloat(v.toFixed(4))); }
        return d;
      };
      return [
        ...prev,
        {
          code,
          name: name || `基金${code}`,
          type: "未知",
          currentNav: parseFloat(nav.toFixed(4)),
          change1d: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
          change1w: parseFloat(((Math.random() - 0.5) * 6).toFixed(2)),
          change1m: parseFloat(((Math.random() - 0.5) * 10).toFixed(2)),
          change3m: parseFloat(((Math.random() - 0.5) * 20).toFixed(2)),
          change6m: parseFloat(((Math.random() - 0.5) * 25).toFixed(2)),
          change1y: parseFloat(((Math.random() - 0.5) * 30).toFixed(2)),
          changeYtd: parseFloat(((Math.random() - 0.5) * 15).toFixed(2)),
          addedDate: new Date().toISOString().split("T")[0],
          tags: [],
          riskLevel: (["低", "中低", "中", "中高", "高"] as const)[Math.floor(Math.random() * 5)],
          sharpeRatio: parseFloat((Math.random() * 2).toFixed(2)),
          maxDrawdown: parseFloat((-(Math.random() * 40 + 5)).toFixed(1)),
          fundSize: parseFloat((Math.random() * 500 + 10).toFixed(0)),
          fundManager: "未知",
          navHistory: genHist(),
        },
      ];
    });
  }, []);

  const removeFromWatchlist = useCallback((code: string) => {
    setWatchlist((prev) => prev.filter((f) => f.code !== code));
  }, []);

  const buyFund = useCallback((code: string, name: string, amount: number, nav: number) => {
    const shares = amount / nav;
    const tradeId = Date.now().toString();

    setTrades((prev) => [...prev, { id: tradeId, fundCode: code, fundName: name, type: "buy", amount, shares, nav, date: new Date().toISOString().split("T")[0] }]);

    setHoldings((prev) => {
      const existing = prev.find((f) => f.code === code);
      if (existing) {
        const newAmount = existing.buyAmount + amount;
        const newShares = existing.buyShares + shares;
        const newCost = newAmount / newShares;
        const newValue = newShares * existing.currentNav;
        return prev.map((f) =>
          f.code === code
            ? { ...f, buyAmount: newAmount, buyShares: newShares, costPerShare: newCost, currentValue: newValue, profit: newValue - newAmount, profitRate: ((newValue - newAmount) / newAmount) * 100 }
            : f
        );
      }
      const currentNav = nav * (1 + (Math.random() - 0.48) * 0.05);
      const currentValue = shares * currentNav;
      const newFund: Fund = {
        code, name, type: "未知", buyDate: new Date().toISOString().split("T")[0],
        buyAmount: amount, buyShares: shares, costPerShare: nav, currentNav,
        currentValue, profit: currentValue - amount, profitRate: ((currentValue - amount) / amount) * 100,
        todayProfit: 0, todayProfitRate: 0, yesterdayProfit: 0, notes: "", tags: [],
      };
      return [...prev, newFund];
    });
  }, []);

  const sellFund = useCallback((code: string, shares: number, nav: number) => {
    setHoldings((prev) => {
      const fund = prev.find((f) => f.code === code);
      if (!fund) return prev;
      const sellShares = Math.min(shares, fund.buyShares);
      const remainingShares = fund.buyShares - sellShares;

      setTrades((t) => [...t, { id: Date.now().toString(), fundCode: code, fundName: fund.name, type: "sell", amount: sellShares * nav, shares: sellShares, nav, date: new Date().toISOString().split("T")[0] }]);

      if (remainingShares <= 0.01) {
        return prev.filter((f) => f.code !== code);
      }
      const newAmount = remainingShares * fund.costPerShare;
      const newValue = remainingShares * fund.currentNav;
      return prev.map((f) =>
        f.code === code
          ? { ...f, buyShares: remainingShares, buyAmount: newAmount, currentValue: newValue, profit: newValue - newAmount, profitRate: ((newValue - newAmount) / newAmount) * 100 }
          : f
      );
    });
  }, []);

  return (
    <FundContext.Provider value={{ totalAssets, setTotalAssets, holdings, watchlist, trades, addToWatchlist, removeFromWatchlist, buyFund, sellFund, cashAvailable, monthlyProfit, yearlyProfit, totalFundValue }}>
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error("useFund must be used within FundProvider");
  return ctx;
};
