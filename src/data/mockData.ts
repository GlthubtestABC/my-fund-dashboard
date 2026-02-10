// Mock fund data for the dashboard

export interface Fund {
  code: string;
  name: string;
  type: string;
  buyDate: string;
  buyAmount: number;
  buyShares: number;
  costPerShare: number;
  currentNav: number;
  currentValue: number;
  profit: number;
  profitRate: number;
  todayProfit: number;
  todayProfitRate: number;
  yesterdayProfit: number;
  notes: string;
  tags: string[];
}

export interface WatchFund {
  code: string;
  name: string;
  type: string;
  currentNav: number;
  change1m: number;
  change3m: number;
  change1y: number;
  addedDate: string;
  tags: string[];
  alertNavBelow?: number;
  alertGainAbove?: number;
}

export interface DailyReturn {
  date: string;
  totalProfit: number;
  totalRate: number;
  csi300: number;
  depositRate: number;
}

export interface FundNavHistory {
  date: string;
  nav: number;
  cumulativeReturn: number;
  csi300Return: number;
}

export const holdingFunds: Fund[] = [
  {
    code: "110011",
    name: "易方达中小盘混合",
    type: "混合型",
    buyDate: "2024-03-15",
    buyAmount: 50000,
    buyShares: 15823.41,
    costPerShare: 3.16,
    currentNav: 3.48,
    currentValue: 55065.47,
    profit: 5065.47,
    profitRate: 10.13,
    todayProfit: 328.50,
    todayProfitRate: 0.60,
    yesterdayProfit: -156.20,
    notes: "长期持有，看好中小盘反弹",
    tags: ["混合型", "长期"],
  },
  {
    code: "005827",
    name: "易方达蓝筹精选混合",
    type: "混合型",
    buyDate: "2024-01-10",
    buyAmount: 80000,
    buyShares: 38834.95,
    costPerShare: 2.06,
    currentNav: 2.24,
    currentValue: 86990.29,
    profit: 6990.29,
    profitRate: 8.74,
    todayProfit: 542.80,
    todayProfitRate: 0.63,
    yesterdayProfit: 312.40,
    notes: "核心持仓，定投中",
    tags: ["混合型", "核心"],
  },
  {
    code: "161725",
    name: "招商中证白酒指数",
    type: "指数型",
    buyDate: "2024-06-20",
    buyAmount: 30000,
    buyShares: 21276.60,
    costPerShare: 1.41,
    currentNav: 1.52,
    currentValue: 32340.44,
    profit: 2340.44,
    profitRate: 7.80,
    todayProfit: -215.30,
    todayProfitRate: -0.66,
    yesterdayProfit: -89.50,
    notes: "消费复苏逻辑",
    tags: ["指数型", "消费"],
  },
  {
    code: "012414",
    name: "国泰中证半导体芯片ETF联接",
    type: "指数型",
    buyDate: "2024-08-05",
    buyAmount: 25000,
    buyShares: 24271.84,
    costPerShare: 1.03,
    currentNav: 1.15,
    currentValue: 27912.62,
    profit: 2912.62,
    profitRate: 11.65,
    todayProfit: 418.70,
    todayProfitRate: 1.52,
    yesterdayProfit: 523.10,
    notes: "科技赛道，波动较大",
    tags: ["指数型", "科技"],
  },
  {
    code: "007119",
    name: "景顺长城绩优成长混合",
    type: "混合型",
    buyDate: "2024-04-22",
    buyAmount: 40000,
    buyShares: 19607.84,
    costPerShare: 2.04,
    currentNav: 2.18,
    currentValue: 42745.10,
    profit: 2745.10,
    profitRate: 6.86,
    todayProfit: 186.20,
    todayProfitRate: 0.44,
    yesterdayProfit: -267.80,
    notes: "成长风格配置",
    tags: ["混合型", "成长"],
  },
  {
    code: "000961",
    name: "天弘沪深300ETF联接",
    type: "指数型",
    buyDate: "2024-02-28",
    buyAmount: 60000,
    buyShares: 45801.53,
    costPerShare: 1.31,
    currentNav: 1.38,
    currentValue: 63206.11,
    profit: 3206.11,
    profitRate: 5.34,
    todayProfit: 275.40,
    todayProfitRate: 0.44,
    yesterdayProfit: 198.30,
    notes: "大盘基准配置",
    tags: ["指数型", "大盘"],
  },
  {
    code: "003834",
    name: "华夏能源革新股票",
    type: "股票型",
    buyDate: "2024-05-18",
    buyAmount: 20000,
    buyShares: 13698.63,
    costPerShare: 1.46,
    currentNav: 1.39,
    currentValue: 19041.10,
    profit: -958.90,
    profitRate: -4.79,
    todayProfit: -312.60,
    todayProfitRate: -1.62,
    yesterdayProfit: -445.30,
    notes: "新能源板块，短期承压",
    tags: ["股票型", "新能源"],
  },
  {
    code: "519732",
    name: "交银定期支付双息平衡混合",
    type: "混合型",
    buyDate: "2024-07-12",
    buyAmount: 35000,
    buyShares: 21341.46,
    costPerShare: 1.64,
    currentNav: 1.71,
    currentValue: 36493.90,
    profit: 1493.90,
    profitRate: 4.27,
    todayProfit: 156.80,
    todayProfitRate: 0.43,
    yesterdayProfit: 78.60,
    notes: "平衡配置，定期分红",
    tags: ["混合型", "分红"],
  },
];

export const watchFunds: WatchFund[] = [
  { code: "320007", name: "诺安成长混合", type: "混合型", currentNav: 1.82, change1m: 5.2, change3m: 12.8, change1y: -3.4, addedDate: "2024-12-01", tags: ["科技", "待买入"], alertNavBelow: 1.70, alertGainAbove: 8 },
  { code: "001838", name: "国投瑞银中证创业成长指数", type: "指数型", currentNav: 0.96, change1m: 3.1, change3m: 8.5, change1y: 15.2, addedDate: "2024-11-15", tags: ["创业板", "观察中"] },
  { code: "519674", name: "银河创新成长混合", type: "混合型", currentNav: 4.35, change1m: -2.1, change3m: 6.4, change1y: 22.8, addedDate: "2025-01-05", tags: ["科技", "稳健型"] },
  { code: "004851", name: "广发医疗保健股票", type: "股票型", currentNav: 2.18, change1m: 1.8, change3m: -4.2, change1y: -12.5, addedDate: "2024-10-20", tags: ["医药", "抄底"] },
  { code: "161903", name: "万家行业优选混合", type: "混合型", currentNav: 1.56, change1m: 4.5, change3m: 9.7, change1y: 18.3, addedDate: "2025-01-20", tags: ["稳健型", "待买入"] },
];

// Generate historical data
export function generateNavHistory(days: number = 365): FundNavHistory[] {
  const data: FundNavHistory[] = [];
  let nav = 1.0;
  let csi300 = 1.0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dailyChange = (Math.random() - 0.48) * 0.03;
    const csi300Change = (Math.random() - 0.49) * 0.025;
    
    nav *= (1 + dailyChange);
    csi300 *= (1 + csi300Change);

    data.push({
      date: date.toISOString().split('T')[0],
      nav: parseFloat(nav.toFixed(4)),
      cumulativeReturn: parseFloat(((nav - 1) * 100).toFixed(2)),
      csi300Return: parseFloat(((csi300 - 1) * 100).toFixed(2)),
    });
  }
  return data;
}

export function generateTotalReturnHistory(days: number = 365): DailyReturn[] {
  const data: DailyReturn[] = [];
  let totalProfit = 0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const principal = 340000;

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dailyProfit = (Math.random() - 0.45) * 1200;
    totalProfit += dailyProfit;
    const csi300 = (Math.random() - 0.49) * 100 + (i * 0.05);

    data.push({
      date: date.toISOString().split('T')[0],
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalRate: parseFloat(((totalProfit / principal) * 100).toFixed(2)),
      csi300: parseFloat(csi300.toFixed(2)),
      depositRate: parseFloat((i * (2.5 / 365) * (principal / 100)).toFixed(2)),
    });
  }
  return data;
}

export const getTodayOverview = () => {
  const todayProfit = holdingFunds.reduce((sum, f) => sum + f.todayProfit, 0);
  const yesterdayProfit = holdingFunds.reduce((sum, f) => sum + f.yesterdayProfit, 0);
  const totalValue = holdingFunds.reduce((sum, f) => sum + f.currentValue, 0);
  const totalCost = holdingFunds.reduce((sum, f) => sum + f.buyAmount, 0);
  const totalProfit = holdingFunds.reduce((sum, f) => sum + f.profit, 0);

  const sorted = [...holdingFunds].sort((a, b) => b.todayProfit - a.todayProfit);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  return {
    todayProfit,
    yesterdayProfit,
    profitDiff: todayProfit - yesterdayProfit,
    todayRate: (todayProfit / totalCost) * 100,
    totalValue,
    totalCost,
    totalProfit,
    totalProfitRate: (totalProfit / totalCost) * 100,
    top3,
    bottom3,
    fundCount: holdingFunds.length,
  };
};
