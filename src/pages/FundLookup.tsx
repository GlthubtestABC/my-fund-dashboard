import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFund } from "@/context/FundContext";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
import {
  Search, TrendingUp, TrendingDown, Star, ShoppingCart, AlertTriangle,
  BarChart3, Shield, Activity, DollarSign, Users, Calendar, ArrowUpRight,
  ArrowDownRight, Eye, ChevronRight, Sparkles,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

// Generate mock detailed fund info based on code
const generateFundDetail = (code: string) => {
  const seed = code.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let callIdx = 0;
  const r = (min: number, max: number) => {
    callIdx++;
    const x = Math.sin(seed * 9301 + 49297 + callIdx * 7919) % 1;
    return min + Math.abs(x) * (max - min);
  };

  const names: Record<string, string> = {
    "110011": "易方达中小盘混合",
    "005827": "易方达蓝筹精选混合",
    "161725": "招商中证白酒指数",
    "320007": "诺安成长混合",
    "519674": "银河创新成长混合",
    "004851": "广发医疗保健股票",
  };

  const types = ["混合型", "股票型", "指数型", "债券型", "QDII"];
  const risks = ["低", "中低", "中", "中高", "高"] as const;
  const managers = ["张坤", "葛兰", "蔡嵩松", "刘格菘", "朱少醒", "谢治宇", "傅鹏博", "萧楠", "黄海", "周蔚文"];

  const nav = parseFloat(r(0.5, 8).toFixed(4));
  const change1d = parseFloat((r(-3, 3)).toFixed(2));
  const change1w = parseFloat((r(-5, 5)).toFixed(2));
  const change1m = parseFloat((r(-8, 10)).toFixed(2));
  const change3m = parseFloat((r(-15, 20)).toFixed(2));
  const change6m = parseFloat((r(-20, 30)).toFixed(2));
  const change1y = parseFloat((r(-25, 40)).toFixed(2));
  const changeYtd = parseFloat((r(-10, 25)).toFixed(2));
  const sharpe = parseFloat(r(0.1, 2.5).toFixed(2));
  const maxDrawdown = parseFloat((-r(5, 50)).toFixed(1));
  const fundSize = parseFloat(r(5, 500).toFixed(0));
  const volatility = parseFloat(r(5, 35).toFixed(1));
  const beta = parseFloat(r(0.5, 1.5).toFixed(2));
  const alpha = parseFloat(r(-5, 10).toFixed(2));
  const infoRatio = parseFloat(r(-0.5, 2).toFixed(2));
  const trackingError = parseFloat(r(1, 15).toFixed(2));

  // Nav history 60 days
  const navHistory: { date: string; nav: number; returnRate: number }[] = [];
  let v = nav * 0.88;
  const baseNav = nav * 0.88;
  const now = new Date();
  for (let i = 59; i >= 0; i--) {
    v *= 1 + (Math.sin(seed + i) * 0.01 + (Math.random() - 0.47) * 0.025);
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    navHistory.push({
      date: d.toISOString().split("T")[0],
      nav: parseFloat(v.toFixed(4)),
      returnRate: parseFloat(((v - baseNav) / baseNav * 100).toFixed(2)),
    });
  }

  // Top holdings
  const stocks = ["贵州茅台", "宁德时代", "腾讯控股", "招商银行", "美团", "比亚迪", "中国平安", "隆基绿能", "药明康德", "海天味业"];
  const topHoldings = stocks
    .sort(() => Math.sin(seed + stocks.length) - 0.3)
    .slice(0, 5)
    .map((name, i) => ({
      name,
      percent: parseFloat((r(3, 12) - i * 1.2).toFixed(2)),
    }));

  // Recommendation
  const score = sharpe * 20 + (change6m > 0 ? 15 : -10) + (maxDrawdown > -25 ? 10 : -5) + (fundSize > 50 ? 5 : 0);
  let recommendation: "建议买入" | "建议关注" | "谨慎观望" | "不建议";
  if (score > 50) recommendation = "建议买入";
  else if (score > 30) recommendation = "建议关注";
  else if (score > 10) recommendation = "谨慎观望";
  else recommendation = "不建议";

  return {
    code,
    name: names[code] || `基金${code}`,
    type: types[seed % types.length],
    nav,
    change1d, change1w, change1m, change3m, change6m, change1y, changeYtd,
    sharpe, maxDrawdown, fundSize, volatility, beta, alpha, infoRatio, trackingError,
    riskLevel: risks[seed % risks.length],
    manager: managers[seed % managers.length],
    establishDate: `20${10 + (seed % 15)}-${String((seed % 12) + 1).padStart(2, "0")}-01`,
    navHistory,
    topHoldings,
    recommendation,
    score: Math.min(100, Math.max(0, Math.round(score))),
  };
};

const ChangeDisplay = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 border border-border/50">
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-bold font-mono-nums ${value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
      {value >= 0 ? "+" : ""}{value}%
    </span>
  </div>
);

const FundLookup = () => {
  const [searchCode, setSearchCode] = useState("");
  const [fundDetail, setFundDetail] = useState<ReturnType<typeof generateFundDetail> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [chartWidth, setChartWidth] = useState(400);
  const chartRef = useRef<HTMLDivElement>(null);
  const { holdings, watchlist, addToWatchlist } = useFund();

  useEffect(() => {
    const measure = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth - 32); // minus padding
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fundDetail]);

  const isHolding = fundDetail ? holdings.some(f => f.code === fundDetail.code) : false;
  const isWatching = fundDetail ? watchlist.some(f => f.code === fundDetail.code) : false;

  const handleSearch = () => {
    const code = searchCode.trim();
    if (!code || code.length < 4) return;
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setFundDetail(generateFundDetail(code));
      setIsSearching(false);
    }, 600);
  };

  const recColor = fundDetail?.recommendation === "建议买入"
    ? "text-emerald-400" : fundDetail?.recommendation === "建议关注"
    ? "text-blue-400" : fundDetail?.recommendation === "谨慎观望"
    ? "text-yellow-400" : "text-red-400";

  const recBg = fundDetail?.recommendation === "建议买入"
    ? "bg-emerald-500/10 border-emerald-500/30" : fundDetail?.recommendation === "建议关注"
    ? "bg-blue-500/10 border-blue-500/30" : fundDetail?.recommendation === "谨慎观望"
    ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30";

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial="hidden" animate="visible"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">临时查看</h1>
              <p className="text-xs text-muted-foreground">输入基金代码，查看详细信息与投资建议</p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={scaleIn} custom={1}>
          <Card className="corner-accent overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="输入基金代码，如 110011、005827..."
                    className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 transition-all"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || searchCode.trim().length < 4}
                  className="relative overflow-hidden"
                >
                  {isSearching ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Activity className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-1" />
                      查询
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {fundDetail && !isSearching && (
            <motion.div
              key={fundDetail.code}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Fund Header Card */}
              <Card className="corner-accent overflow-hidden relative">
                <div className="scan-line" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-foreground">{fundDetail.name}</h2>
                        <Badge variant="outline" className="text-[10px]">{fundDetail.type}</Badge>
                        <Badge variant="outline" className="text-[10px]">{fundDetail.riskLevel}风险</Badge>
                        {isHolding && <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">已持仓</Badge>}
                        {isWatching && <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">已关注</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{fundDetail.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono-nums glow-text">{fundDetail.nav.toFixed(4)}</p>
                      <p className={`text-sm font-mono-nums flex items-center gap-1 justify-end ${fundDetail.change1d >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fundDetail.change1d >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {fundDetail.change1d >= 0 ? "+" : ""}{fundDetail.change1d}%
                      </p>
                    </div>
                  </div>

                  {/* Recommendation Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${recBg}`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${recColor}`} />
                      <span className={`text-sm font-bold ${recColor}`}>{fundDetail.recommendation}</span>
                      <span className="text-xs text-muted-foreground ml-2">综合评分</span>
                      <span className={`text-sm font-bold font-mono-nums ${recColor}`}>{fundDetail.score}/100</span>
                    </div>
                    <div className="flex gap-2">
                      {!isWatching && (
                        <Button
                          size="sm" variant="outline"
                          onClick={() => addToWatchlist(fundDetail.code, fundDetail.name)}
                          className="text-xs h-7"
                        >
                          <Eye className="w-3 h-3 mr-1" /> 加入关注
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Performance Grid */}
              <motion.div
                variants={staggerContainer} initial="hidden" animate="visible"
                className="grid grid-cols-7 gap-2"
              >
                {[
                  { label: "近1日", value: fundDetail.change1d },
                  { label: "近1周", value: fundDetail.change1w },
                  { label: "近1月", value: fundDetail.change1m },
                  { label: "近3月", value: fundDetail.change3m },
                  { label: "近6月", value: fundDetail.change6m },
                  { label: "近1年", value: fundDetail.change1y },
                  { label: "今年来", value: fundDetail.changeYtd },
                ].map((item, i) => (
                  <motion.div key={item.label} variants={fadeUp} custom={i}>
                    <ChangeDisplay value={item.value} label={item.label} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Row - Full Width */}
              <div className="grid grid-cols-2 gap-4">
                {/* NAV Chart */}
                <div ref={chartRef}>
                  <Card className="corner-accent">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        近60日净值走势
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <AreaChart width={chartWidth} height={200} data={fundDetail.navHistory}>
                        <defs>
                          <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={false} axisLine={false} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                        />
                        <Area type="monotone" dataKey="nav" stroke="hsl(var(--primary))" fill="url(#navGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </CardContent>
                  </Card>
                </div>

                {/* Return Rate Chart */}
                <div>
                  <Card className="corner-accent">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        近60日涨幅曲线
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <AreaChart width={chartWidth} height={200} data={fundDetail.navHistory}>
                        <defs>
                          <linearGradient id="returnGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={false} axisLine={false} />
                        <YAxis
                          domain={["auto", "auto"]}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false} tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                          formatter={(value: number) => [`${value}%`, "涨幅"]}
                        />
                        <Area type="monotone" dataKey="returnRate" stroke="#34d399" fill="url(#returnGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Core Risk Metrics - Full Width Detailed */}
              <motion.div variants={fadeUp} custom={4}>
                <Card className="corner-accent">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      核心风险指标
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-5 gap-4">
                      {/* Sharpe */}
                      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs font-medium">夏普比率</span>
                        </div>
                        <p className={`text-2xl font-bold font-mono-nums ${fundDetail.sharpe > 1 ? "text-emerald-400" : fundDetail.sharpe > 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                          {fundDetail.sharpe.toFixed(2)}
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${fundDetail.sharpe > 1 ? "bg-emerald-400" : fundDetail.sharpe > 0.5 ? "bg-yellow-400" : "bg-red-400"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (fundDetail.sharpe / 2.5) * 100)}%` }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {fundDetail.sharpe > 1.5 ? "优秀：单位风险超额回报高" : fundDetail.sharpe > 1 ? "良好：风险调整后收益较好" : fundDetail.sharpe > 0.5 ? "一般：风险收益比中等" : "较差：承担风险未获足够补偿"}
                        </p>
                      </div>

                      {/* Max Drawdown */}
                      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-xs font-medium">最大回撤</span>
                        </div>
                        <p className={`text-2xl font-bold font-mono-nums ${fundDetail.maxDrawdown > -15 ? "text-emerald-400" : fundDetail.maxDrawdown > -30 ? "text-yellow-400" : "text-red-400"}`}>
                          {fundDetail.maxDrawdown}%
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${fundDetail.maxDrawdown > -15 ? "bg-emerald-400" : fundDetail.maxDrawdown > -30 ? "bg-yellow-400" : "bg-red-400"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.abs(fundDetail.maxDrawdown) * 2)}%` }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {fundDetail.maxDrawdown > -15 ? "回撤可控，风险管理优秀" : fundDetail.maxDrawdown > -30 ? "中等回撤，注意仓位控制" : "回撤较大，高风险承受力要求"}
                        </p>
                      </div>

                      {/* Volatility */}
                      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs font-medium">年化波动率</span>
                        </div>
                        <p className={`text-2xl font-bold font-mono-nums ${fundDetail.volatility < 15 ? "text-emerald-400" : fundDetail.volatility < 25 ? "text-yellow-400" : "text-red-400"}`}>
                          {fundDetail.volatility}%
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${fundDetail.volatility < 15 ? "bg-emerald-400" : fundDetail.volatility < 25 ? "bg-yellow-400" : "bg-red-400"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (fundDetail.volatility / 35) * 100)}%` }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {fundDetail.volatility < 15 ? "低波动，适合稳健投资者" : fundDetail.volatility < 25 ? "中等波动，需一定风险承受力" : "高波动，价格起伏剧烈"}
                        </p>
                      </div>

                      {/* Beta */}
                      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs font-medium">Beta 系数</span>
                        </div>
                        <p className={`text-2xl font-bold font-mono-nums ${fundDetail.beta < 0.9 ? "text-emerald-400" : fundDetail.beta < 1.2 ? "text-yellow-400" : "text-red-400"}`}>
                          {fundDetail.beta.toFixed(2)}
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${fundDetail.beta < 0.9 ? "bg-emerald-400" : fundDetail.beta < 1.2 ? "bg-yellow-400" : "bg-red-400"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (fundDetail.beta / 1.5) * 100)}%` }}
                            transition={{ delay: 0.55, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {fundDetail.beta < 0.8 ? "防御型，市场下跌时抗跌" : fundDetail.beta < 1.1 ? "跟随市场波动，β≈1" : "进攻型，放大市场波动"}
                        </p>
                      </div>

                      {/* Alpha */}
                      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-xs font-medium">Alpha 超额</span>
                        </div>
                        <p className={`text-2xl font-bold font-mono-nums ${fundDetail.alpha > 3 ? "text-emerald-400" : fundDetail.alpha > 0 ? "text-yellow-400" : "text-red-400"}`}>
                          {fundDetail.alpha > 0 ? "+" : ""}{fundDetail.alpha}%
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${fundDetail.alpha > 3 ? "bg-emerald-400" : fundDetail.alpha > 0 ? "bg-yellow-400" : "bg-red-400"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, Math.max(5, (fundDetail.alpha + 5) / 15 * 100))}%` }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {fundDetail.alpha > 3 ? "超额收益显著，基金经理选股能力强" : fundDetail.alpha > 0 ? "有一定超额收益，表现尚可" : "未跑赢基准，选股能力待验证"}
                        </p>
                      </div>
                    </div>

                    {/* Additional metrics row */}
                    <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/30">
                      {[
                        { label: "信息比率", value: fundDetail.infoRatio.toFixed(2), desc: "主动管理能力" },
                        { label: "跟踪误差", value: `${fundDetail.trackingError}%`, desc: "偏离基准程度" },
                        { label: "基金规模", value: `${fundDetail.fundSize}亿`, desc: fundDetail.fundSize > 100 ? "大型基金" : fundDetail.fundSize > 20 ? "中型基金" : "小型基金" },
                        { label: "基金经理", value: fundDetail.manager, desc: `成立于 ${fundDetail.establishDate}` },
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + i * 0.05 }}
                          className="flex flex-col gap-0.5"
                        >
                          <span className="text-[10px] text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-semibold text-foreground font-mono-nums">{item.value}</span>
                          <span className="text-[10px] text-muted-foreground/60">{item.desc}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Top Holdings */}
              <motion.div variants={fadeUp} custom={5}>
                <Card className="corner-accent">
                  <CardHeader className="pb-2 pt-4 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      前五大持仓
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="grid grid-cols-5 gap-3">
                      {fundDetail.topHoldings.map((stock, i) => (
                        <motion.div
                          key={stock.name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center space-y-1.5"
                        >
                          <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary mx-auto">
                            {i + 1}
                          </span>
                          <p className="text-xs font-medium text-foreground">{stock.name}</p>
                          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-primary/60"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, stock.percent * 8)}%` }}
                              transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                            />
                          </div>
                          <p className="text-xs font-mono-nums text-muted-foreground">{stock.percent}%</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!fundDetail && !isSearching && (
          <motion.div variants={fadeUp} custom={2} className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-border/50">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm">输入基金代码开始查询</p>
            <p className="text-xs mt-1 text-muted-foreground/60">支持场内外基金代码，查看详情后可一键关注</p>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default FundLookup;
