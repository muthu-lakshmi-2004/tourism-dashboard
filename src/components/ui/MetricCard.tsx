import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  delay?: number;
}

export function MetricCard({ title, value, trend, icon, delay = 0 }: MetricCardProps) {
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-card border border-border/50 rounded-[16px] p-6 ceramic-shadow hover:ceramic-shadow-hover transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="text-muted-foreground">{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-primary" : "text-destructive"}`}>
          {isPositive ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} /> : <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.5} />}
          <span className="tabular-nums">{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-5xl font-display font-medium tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </motion.div>
  );
}
