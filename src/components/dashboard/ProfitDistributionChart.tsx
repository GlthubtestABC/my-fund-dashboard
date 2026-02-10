import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useFund } from "@/context/FundContext";

const COLORS = [
  "hsl(0, 85%, 55%)", "hsl(35, 95%, 55%)", "hsl(210, 70%, 55%)",
  "hsl(280, 55%, 55%)", "hsl(180, 60%, 45%)", "hsl(320, 60%, 50%)",
  "hsl(50, 80%, 50%)", "hsl(150, 50%, 45%)",
];

const ProfitDistributionChart = () => {
  const { holdings } = useFund();
  const data = holdings
    .filter((f) => f.todayProfit !== 0)
    .map((f) => ({
      name: f.name.length > 8 ? f.name.slice(0, 8) + "..." : f.name,
      fullName: f.name,
      value: Math.abs(f.todayProfit),
      profit: f.todayProfit,
      isPositive: f.todayProfit > 0,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-muted-foreground">{d.fullName}</p>
          <p className={`text-sm font-semibold font-mono-nums ${d.isPositive ? "text-profit" : "text-loss"}`}>
            {d.isPositive ? "+" : ""}¥{d.profit.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">今日收益分布</h3>
        <p className="text-sm text-muted-foreground text-center py-8">暂无持仓数据</p>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl border border-border p-5 animate-slide-up">
      <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-4">今日收益分布</h3>
      <div className="flex items-center gap-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-muted-foreground truncate flex-1">{item.name}</span>
              <span className={`font-mono-nums font-medium ${item.isPositive ? "text-profit" : "text-loss"}`}>
                {item.isPositive ? "+" : ""}¥{item.profit.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfitDistributionChart;
