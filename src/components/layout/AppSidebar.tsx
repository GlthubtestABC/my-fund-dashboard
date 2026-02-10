import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useFund } from "@/context/FundContext";
import {
  LayoutDashboard, TrendingUp, LineChart, BarChart3, Briefcase, Eye,
  ChevronLeft, ChevronRight, Settings, Zap, RefreshCw,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "今日总览", path: "/" },
  { icon: Briefcase, label: "持仓管理", path: "/portfolio" },
  { icon: Eye, label: "关注池", path: "/watchlist" },
  { icon: LineChart, label: "基金涨幅", path: "/fund-chart" },
  { icon: TrendingUp, label: "收益曲线", path: "/earnings" },
  { icon: BarChart3, label: "总收益", path: "/total-returns" },
  { icon: RefreshCw, label: "数据同步", path: "/data-sync" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAssetInput, setShowAssetInput] = useState(false);
  const [assetInput, setAssetInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { totalAssets, setTotalAssets, totalFundValue } = useFund();

  const handleSetAsset = () => {
    const val = parseFloat(assetInput);
    if (!isNaN(val) && val > 0) {
      setTotalAssets(val);
      setShowAssetInput(false);
      setAssetInput("");
    }
  };

  return (
    <aside className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-accent-foreground text-sm tracking-wide">FundPilot</span>
          </motion.div>
        )}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative ${
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-[inset_0_0_12px_hsl(var(--primary)/0.08)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span>{item.label}</span>}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground space-y-2">
            <div className="flex items-center justify-between">
              <p>总资产额度</p>
              <motion.button whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}
                onClick={() => { setShowAssetInput(!showAssetInput); setAssetInput(totalAssets.toString()); }}
                className="p-1 rounded hover:bg-sidebar-accent transition-colors">
                <Settings className="w-3 h-3" />
              </motion.button>
            </div>
            <p className="text-foreground font-semibold text-base font-mono-nums">
              ¥{totalAssets.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </p>
            {showAssetInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex gap-1">
                <input type="number" value={assetInput} onChange={(e) => setAssetInput(e.target.value)}
                  className="flex-1 bg-sidebar-accent border border-sidebar-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-0"
                  placeholder="输入金额" onKeyDown={(e) => e.key === "Enter" && handleSetAsset()} />
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSetAsset}
                  className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">确定</motion.button>
              </motion.div>
            )}
            <div className="pt-1 space-y-1">
              <div className="flex justify-between">
                <span>持仓市值</span>
                <span className="text-foreground font-mono-nums">¥{totalFundValue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>仓位</span>
                <span className="text-foreground font-mono-nums">{((totalFundValue / totalAssets) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;