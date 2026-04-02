import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  index?: number;
}

export default function StatCard({ title, value, change, changeType = "neutral", icon: Icon, index = 0 }: StatCardProps) {
  const TrendIcon = changeType === "positive" ? TrendingUp : changeType === "negative" ? TrendingDown : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card-pro p-3.5 sm:p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
          {change && (
            <div className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold",
              changeType === "positive" && "bg-success/10 text-success",
              changeType === "negative" && "bg-destructive/10 text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        <div className="rounded-lg sm:rounded-xl bg-primary/10 p-2 sm:p-3 shrink-0 ml-2">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
