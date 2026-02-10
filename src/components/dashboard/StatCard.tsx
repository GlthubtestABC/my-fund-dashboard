import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

const StatCard = ({ title, value, subtitle, change, changeLabel, icon, className = "" }: StatCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isZero = change === undefined || change === 0;

  return (
    <div className={`card-gradient rounded-xl border border-border p-5 animate-slide-up ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {title}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="font-mono-nums">
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          <div
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
              isPositive
                ? "bg-profit-muted text-profit"
                : isNegative
                ? "bg-loss-muted text-loss"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : isNegative ? (
              <ArrowDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(change).toFixed(2)}</span>
          </div>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
