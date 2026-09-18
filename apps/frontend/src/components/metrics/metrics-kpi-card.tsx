import type { ComponentType } from "react";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface MetricsKpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  badgeText?: string;
  badgeVariant?: VariantProps<typeof badgeVariants>["variant"];
  accentColor?: "primary" | "emerald" | "amber" | "blue";
}

export function MetricsKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = "secondary",
  accentColor = "primary",
}: MetricsKpiCardProps) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  }[accentColor];

  return (
    <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-2xl border",
              accentStyles,
            )}
          >
            <Icon className="size-5.5" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {title}
            </h3>
          </div>
        </div>

        {badgeText && (
          <Badge variant={badgeVariant} className="text-[11px] font-bold">
            {badgeText}
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <div className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          {value}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
    </Card>
  );
}

export default MetricsKpiCard;
