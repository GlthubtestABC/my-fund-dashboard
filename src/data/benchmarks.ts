// Benchmark definitions and data generation for chart comparisons

export interface Benchmark {
  id: string;
  name: string;
  category: "index" | "commodity" | "deposit" | "custom";
  color: string;
  dashArray?: string;
  // For simulation: annual return and volatility
  annualReturn: number;
  volatility: number;
}

export const PRESET_BENCHMARKS: Benchmark[] = [
  // 指数基金
  { id: "csi300", name: "沪深300", category: "index", color: "hsl(200, 80%, 55%)", annualReturn: 0.08, volatility: 0.018 },
  { id: "csi500", name: "中证500", category: "index", color: "hsl(280, 65%, 60%)", annualReturn: 0.10, volatility: 0.022 },
  { id: "csi1000", name: "中证1000", category: "index", color: "hsl(320, 70%, 55%)", annualReturn: 0.12, volatility: 0.025 },
  { id: "sse50", name: "上证50", category: "index", color: "hsl(30, 80%, 55%)", annualReturn: 0.06, volatility: 0.016 },
  { id: "gem", name: "创业板指", category: "index", color: "hsl(170, 65%, 45%)", annualReturn: 0.14, volatility: 0.028 },
  { id: "star50", name: "科创50", category: "index", color: "hsl(250, 70%, 60%)", annualReturn: 0.15, volatility: 0.032 },
  { id: "nasdaq", name: "纳斯达克100", category: "index", color: "hsl(210, 90%, 55%)", annualReturn: 0.16, volatility: 0.020 },
  { id: "sp500", name: "标普500", category: "index", color: "hsl(0, 0%, 60%)", annualReturn: 0.10, volatility: 0.015 },
  // 商品
  { id: "gold", name: "黄金", category: "commodity", color: "hsl(45, 90%, 50%)", annualReturn: 0.07, volatility: 0.012 },
  { id: "silver", name: "白银", category: "commodity", color: "hsl(0, 0%, 72%)", annualReturn: 0.05, volatility: 0.020 },
  // 存款
  { id: "deposit_1y", name: "一年定期存款", category: "deposit", color: "hsl(38, 92%, 50%)", dashArray: "6 3", annualReturn: 0.0175, volatility: 0 },
  { id: "deposit_3y", name: "三年定期存款", category: "deposit", color: "hsl(25, 80%, 50%)", dashArray: "6 3", annualReturn: 0.026, volatility: 0 },
  { id: "deposit_5y", name: "五年定期存款", category: "deposit", color: "hsl(15, 70%, 50%)", dashArray: "6 3", annualReturn: 0.03, volatility: 0 },
  { id: "mmf", name: "货币基金（余额宝）", category: "deposit", color: "hsl(50, 60%, 55%)", dashArray: "4 4", annualReturn: 0.018, volatility: 0.001 },
];

// Colors for custom fund benchmarks
const CUSTOM_COLORS = [
  "hsl(340, 75%, 55%)", "hsl(190, 70%, 50%)", "hsl(120, 50%, 45%)",
  "hsl(60, 70%, 50%)", "hsl(300, 60%, 55%)", "hsl(150, 60%, 45%)",
];

export function createCustomBenchmark(code: string, name: string, colorIndex: number): Benchmark {
  return {
    id: `custom_${code}`,
    name: name || `基金${code}`,
    category: "custom",
    color: CUSTOM_COLORS[colorIndex % CUSTOM_COLORS.length],
    annualReturn: 0.05 + Math.random() * 0.15,
    volatility: 0.010 + Math.random() * 0.020,
  };
}

// Generate benchmark return curve for given days using deterministic seed from id
export function generateBenchmarkCurve(benchmark: Benchmark, days: number, dates: string[]): number[] {
  const dailyReturn = benchmark.annualReturn / 252;
  const results: number[] = [];
  let cumulative = 0;

  // Use id hash as seed for consistent but different curves
  let seed = 0;
  for (let i = 0; i < benchmark.id.length; i++) seed += benchmark.id.charCodeAt(i);

  const seededRandom = (i: number) => {
    const x = Math.sin(seed * 100 + i * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  };

  for (let i = 0; i < days; i++) {
    const noise = benchmark.volatility > 0 ? (seededRandom(i) - 0.48) * benchmark.volatility * 100 : 0;
    cumulative += dailyReturn * 100 + noise;
    results.push(parseFloat(cumulative.toFixed(2)));
  }
  return results;
}

export interface BenchmarkConfig {
  selectedIds: string[];
  customFunds: { code: string; name: string }[];
}

export function loadBenchmarkConfig(): BenchmarkConfig {
  try {
    const stored = localStorage.getItem("fp_benchmarkConfig");
    return stored ? JSON.parse(stored) : { selectedIds: ["csi300"], customFunds: [] };
  } catch {
    return { selectedIds: ["csi300"], customFunds: [] };
  }
}

export function saveBenchmarkConfig(config: BenchmarkConfig) {
  localStorage.setItem("fp_benchmarkConfig", JSON.stringify(config));
}
