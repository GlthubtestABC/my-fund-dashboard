import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateNavHistory } from "@/data/mockData";
import { useFund } from "@/context/FundContext";
import {
  PRESET_BENCHMARKS,
  createCustomBenchmark,
  generateBenchmarkCurve,
  loadBenchmarkConfig,
  saveBenchmarkConfig,
  BenchmarkConfig,
  Benchmark,
} from "@/data/benchmarks";
import BenchmarkSettings from "@/components/chart/BenchmarkSettings";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const periods = [
  { label: "1月", days: 30 },
  { label: "3月", days: 90 },
  { label: "6月", days: 180 },
  { label: "1年", days: 365 },
  { label: "3年", days: 365 * 3 },
  { label: "5年", days: 365 * 5 },
  { label: "10年", days: 365 * 10 },
  { label: "成立以来", days: 365 * 15 },
];

const FundChart = () => {
  const { holdings } = useFund();
  const [selectedFund, setSelectedFund] = useState(holdings[0]?.code || "");
  const [periodIdx, setPeriodIdx] = useState(3);
  const [mode, setMode] = useState<"cumulative" | "annualized">("cumulative");
  const [benchmarkConfig, setBenchmarkConfig] = useState<BenchmarkConfig>(loadBenchmarkConfig);

  const handleConfigChange = useCallback((config: BenchmarkConfig) => {
    setBenchmarkConfig(config);
    saveBenchmarkConfig(config);
  }, []);

  // Resolve active benchmarks from config
  const activeBenchmarks = useMemo((): Benchmark[] => {
    return benchmarkConfig.selectedIds.map((id) => {
      const preset = PRESET_BENCHMARKS.find((b) => b.id === id);
      if (preset) return preset;
      // custom fund
      const code = id.replace("custom_", "");
      const customFund = benchmarkConfig.customFunds.find((f) => f.code === code);
      if (customFund) {
        const idx = benchmarkConfig.customFunds.indexOf(customFund);
        return createCustomBenchmark(customFund.code, customFund.name, idx);
      }
      return null;
    }).filter(Boolean) as Benchmark[];
  }, [benchmarkConfig]);

  const data = useMemo(() => {
    const days = periods[periodIdx].days;
    const history = generateNavHistory(days);

    // Generate benchmark curves
    const benchmarkCurves: Record<string, number[]> = {};
    for (const bench of activeBenchmarks) {
      benchmarkCurves[bench.id] = generateBenchmarkCurve(bench, days, history.map((d) => d.date));
    }

    return history.map((d, i) => {
      let fundReturn = d.cumulativeReturn;
      if (mode === "annualized") {
        fundReturn = parseFloat(((Math.pow(1 + d.cumulativeReturn / 100, 365 / Math.max(1, days)) - 1) * 100).toFixed(2));
      }

      const row: Record<string, any> = {
        date: d.date,
        fundReturn,
      };

      for (const bench of activeBenchmarks) {
        let val = benchmarkCurves[bench.id][i];
        if (mode === "annualized") {
          val = parseFloat(((Math.pow(1 + val / 100, 365 / Math.max(1, days)) - 1) * 100).toFixed(2));
        }
        row[bench.id] = val;
      }

      return row;
    });
  }, [selectedFund, periodIdx, mode, activeBenchmarks]);

  const fund = holdings.find((f) => f.code === selectedFund);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-xl min-w-[180px]">
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          {payload.map((p: any) => (
            <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{p.name}</span>
              </div>
              <span className="text-xs font-semibold font-mono-nums" style={{ color: p.color }}>
                {p.value > 0 ? "+" : ""}{p.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!fund) return <DashboardLayout><p className="text-muted-foreground text-center py-20">暂无持仓基金</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">基金涨幅对比</h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看基金表现，叠加多种基准对比
            {activeBenchmarks.length > 0 && (
              <span className="text-primary ml-1">· 已选 {activeBenchmarks.length} 个对比基准</span>
            )}
          </p>
        </div>
        <BenchmarkSettings config={benchmarkConfig} onChange={handleConfigChange} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedFund}
          onChange={(e) => setSelectedFund(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {holdings.map((f) => (
            <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
          ))}
        </select>

        <div className="flex bg-secondary rounded-lg p-0.5">
          {periods.map((p, i) => (
            <button key={p.label} onClick={() => setPeriodIdx(i)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${periodIdx === i ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:text-foreground"}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex bg-secondary rounded-lg p-0.5">
          <button onClick={() => setMode("cumulative")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === "cumulative" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"}`}>
            累计涨幅
          </button>
          <button onClick={() => setMode("annualized")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === "annualized" ? "bg-primary text-primary-foreground" : "text-secondary-foreground"}`}>
            年化涨幅
          </button>
        </div>
      </div>

      {/* Active benchmark tags */}
      {activeBenchmarks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {activeBenchmarks.map((b) => (
            <span key={b.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
              {b.name}
            </span>
          ))}
        </div>
      )}

      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">{fund.name}</h3>
          <p className="text-xs text-muted-foreground">{fund.code} · {fund.type}</p>
        </div>
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickLine={false}
                axisLine={{ stroke: "hsl(220, 14%, 16%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} tickLine={false}
                axisLine={{ stroke: "hsl(220, 14%, 16%)" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

              {/* Main fund line */}
              <Line type="monotone" dataKey="fundReturn" name={fund.name}
                stroke="hsl(160, 70%, 44%)" strokeWidth={2.5} dot={false}
                activeDot={{ r: 4, fill: "hsl(160, 70%, 44%)" }} />

              {/* Benchmark lines */}
              {activeBenchmarks.map((b) => (
                <Line key={b.id} type="monotone" dataKey={b.id} name={b.name}
                  stroke={b.color} strokeWidth={1.5} strokeDasharray={b.dashArray || "0"}
                  dot={false} activeDot={{ r: 3, fill: b.color }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FundChart;
