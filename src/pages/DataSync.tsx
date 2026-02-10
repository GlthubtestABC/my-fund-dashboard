import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFund } from "@/context/FundContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeUp, scaleIn, staggerContainer } from "@/lib/motion";
import {
  RefreshCw, CheckCircle2, XCircle, ChevronLeft, Clock,
  TrendingUp, TrendingDown, Database, Zap, ArrowRight,
} from "lucide-react";

interface SyncRecord {
  date: string;
  synced: boolean;
  syncTime?: string;
  funds: { code: string; name: string; nav: number; change: number }[];
}

const generateSyncHistory = (
  holdings: { code: string; name: string; currentNav: number; todayProfitRate: number }[],
  watchlist: { code: string; name: string; currentNav: number; change1d: number }[]
): SyncRecord[] => {
  const records: SyncRecord[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const synced = isWeekend ? false : i > 0 ? Math.random() > 0.2 : false;

    const allFunds = [
      ...holdings.map((f) => ({
        code: f.code, name: f.name,
        nav: +(f.currentNav * (1 + (Math.random() - 0.5) * 0.02 * i)).toFixed(4),
        change: +((Math.random() - 0.48) * 4).toFixed(2),
      })),
      ...watchlist.map((f) => ({
        code: f.code, name: f.name,
        nav: +(f.currentNav * (1 + (Math.random() - 0.5) * 0.02 * i)).toFixed(4),
        change: +((Math.random() - 0.48) * 4).toFixed(2),
      })),
    ];

    records.push({
      date: dateStr,
      synced,
      syncTime: synced ? `${8 + Math.floor(Math.random() * 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : undefined,
      funds: synced ? allFunds : [],
    });
  }
  return records;
};

const DataSync = () => {
  const { holdings, watchlist } = useFund();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const syncHistory = useMemo(
    () => generateSyncHistory(holdings, watchlist),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holdings.length, watchlist.length]
  );

  const selectedRecord = syncHistory.find((r) => r.date === selectedDate);
  const syncedCount = syncHistory.filter((r) => r.synced).length;
  const totalFunds = holdings.length + watchlist.length;

  const handleSync = (date: string) => {
    setSyncing(date);
    setTimeout(() => {
      const rec = syncHistory.find((r) => r.date === date);
      if (rec) {
        rec.synced = true;
        rec.syncTime = new Date().toTimeString().slice(0, 5);
        rec.funds = [
          ...holdings.map((f) => ({ code: f.code, name: f.name, nav: f.currentNav, change: f.todayProfitRate })),
          ...watchlist.map((f) => ({ code: f.code, name: f.name, nav: f.currentNav, change: f.change1d })),
        ];
      }
      setSyncing(null);
    }, 1500);
  };

  const formatDate = (ds: string) => {
    const d = new Date(ds);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  const formatWeekday = (ds: string) => {
    return ["日", "一", "二", "三", "四", "五", "六"][new Date(ds).getDay()];
  };

  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedDate && (
              <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedDate(null)}
                className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {selectedDate ? `${selectedDate} 同步详情` : "数据同步"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDate ? `共同步 ${selectedRecord?.funds.length || 0} 只基金` : `近30天已同步 ${syncedCount}/30 天 · 覆盖 ${totalFunds} 只基金`}
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedDate ? (
            /* ===== Calendar View ===== */
            <motion.div key="calendar" initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }}
              variants={staggerContainer} className="space-y-4">

              {/* Stats */}
              <motion.div variants={fadeUp} custom={1} className="grid grid-cols-3 gap-3">
                {[
                  { label: "已同步", value: `${syncedCount}天`, icon: CheckCircle2, color: "text-emerald-400" },
                  { label: "未同步", value: `${30 - syncedCount}天`, icon: XCircle, color: "text-red-400" },
                  { label: "监控基金", value: `${totalFunds}只`, icon: Database, color: "text-primary" },
                ].map((s, i) => (
                  <Card key={i} className="corner-accent overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted/50 ${s.color}`}>
                        <s.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-lg font-bold font-mono-nums text-foreground">{s.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {/* Timeline */}
              <motion.div variants={fadeUp} custom={2}>
                <Card className="corner-accent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      近30天同步记录
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {[...syncHistory].reverse().map((rec, idx) => {
                      const isToday = idx === 0;
                      const isWeekend = new Date(rec.date).getDay() === 0 || new Date(rec.date).getDay() === 6;
                      return (
                        <motion.div
                          key={rec.date}
                          variants={fadeUp} custom={idx * 0.3}
                          initial="hidden" animate="visible"
                          whileHover={{ x: 4, backgroundColor: "hsl(var(--accent) / 0.5)" }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => rec.synced ? setSelectedDate(rec.date) : undefined}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer group ${
                            isToday ? "bg-primary/5 border border-primary/20" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              rec.synced ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                : isWeekend ? "bg-muted-foreground/30" : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                            }`} />
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono-nums text-foreground">{rec.date}</span>
                              <span className="text-xs text-muted-foreground">周{formatWeekday(rec.date)}</span>
                              {isToday && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">今天</Badge>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rec.synced ? (
                              <>
                                <span className="text-xs text-muted-foreground">{rec.syncTime} 同步</span>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{rec.funds.length}只</Badge>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            ) : isWeekend ? (
                              <span className="text-xs text-muted-foreground/50">休市</span>
                            ) : (
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="sm" variant="outline"
                                  className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                                  disabled={syncing === rec.date}
                                  onClick={(e) => { e.stopPropagation(); handleSync(rec.date); }}>
                                  <RefreshCw className={`w-3 h-3 mr-1 ${syncing === rec.date ? "animate-spin" : ""}`} />
                                  {syncing === rec.date ? "同步中..." : "一键同步"}
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            /* ===== Detail View ===== */
            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="space-y-4">

              {selectedRecord && selectedRecord.funds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRecord.funds.map((fund, idx) => (
                    <motion.div key={fund.code} variants={scaleIn} custom={idx}
                      initial="hidden" animate="visible"
                      whileHover={{ y: -2, boxShadow: "0 8px 24px hsl(var(--primary) / 0.1)" }}
                    >
                      <Card className="corner-accent overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{fund.name}</p>
                              <p className="text-xs text-muted-foreground font-mono-nums">{fund.code}</p>
                            </div>
                            <Badge variant={fund.change >= 0 ? "default" : "destructive"}
                              className="font-mono-nums text-xs">
                              {fund.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {fund.change >= 0 ? "+" : ""}{fund.change}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">净值</span>
                            <span className="font-mono-nums text-foreground font-semibold">{fund.nav.toFixed(4)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="corner-accent">
                  <CardContent className="p-12 text-center">
                    <XCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">当天无同步数据</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default DataSync;
