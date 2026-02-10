import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFund } from "@/context/FundContext";
import {
  LayoutDashboard, TrendingUp, LineChart, BarChart3, Briefcase, Eye,
  ChevronLeft, ChevronRight, Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "今日总览", path: "/" },
  { icon: Briefcase, label: "持仓管理", path: "/portfolio" },
  { icon: Eye, label: "关注池", path: "/watchlist" },
  { icon: LineChart, label: "基金涨幅", path: "/fund-chart" },
  { icon: TrendingUp, label: "收益曲线", path: "/earnings" },
  { icon: BarChart3, label: "总收益", path: "/total-returns" },
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
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-accent-foreground text-sm tracking-wide">FundPilot</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-xs text-muted-foreground animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <p>总资产额度</p>
              <button onClick={() => { setShowAssetInput(!showAssetInput); setAssetInput(totalAssets.toString()); }} className="p-1 rounded hover:bg-sidebar-accent transition-colors">
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <p className="text-foreground font-semibold text-base font-mono-nums">
              ¥{totalAssets.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
            </p>
            {showAssetInput && (
              <div className="flex gap-1 animate-slide-up">
                <input type="number" value={assetInput} onChange={(e) => setAssetInput(e.target.value)}
                  className="flex-1 bg-sidebar-accent border border-sidebar-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-0"
                  placeholder="输入金额" onKeyDown={(e) => e.key === "Enter" && handleSetAsset()} />
                <button onClick={handleSetAsset} className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">确定</button>
              </div>
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
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
