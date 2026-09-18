import type { Plan, Subscriber, Subscription } from "@repo/contracts";
import { Calendar, CheckCircle2, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { calculateTenure, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  item: {
    subscription: Subscription;
    subscriber: Subscriber;
    plan: Plan;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function SubscriptionCard({ item, isSelected, onSelect }: SubscriptionCardProps) {
  const { subscription, subscriber, plan } = item;
  const tenure = calculateTenure(subscription.startedAt);
  const isPremiumPlan = plan.priceCents >= 10000 || plan.name.toLowerCase().includes("premium");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex flex-col justify-between p-6 cursor-pointer border-2 transition-all duration-200 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-gradient-to-b from-primary/[0.04] to-background ring-2 ring-primary/20 shadow-md scale-[1.01]"
          : "border-border hover:border-primary/50 hover:shadow-sm bg-card",
      )}
    >
      {/* Top badges and Selection Radio */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="success" className="font-bold">
            Ativo
          </Badge>
          {isPremiumPlan && (
            <Badge variant="highlight" className="gap-1">
              <Sparkles className="size-3" />
              Alto Valor
            </Badge>
          )}
        </div>

        {/* Radio Indicator */}
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isSelected
              ? "border-primary bg-primary text-white"
              : "border-muted-foreground/40 group-hover:border-primary/60",
          )}
          aria-hidden="true"
        >
          {isSelected && <div className="size-2 rounded-full bg-white" />}
        </div>
      </div>

      {/* Plan and Price */}
      <div className="space-y-2 pb-4 border-b border-border/60">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            {plan.name}
          </h2>
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            {plan.cycle === "MONTHLY" ? "Mensal" : "Anual"}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-primary">
            {formatCurrency(plan.priceCents)}
          </span>
          <span className="text-xs text-muted-foreground font-medium">/ mês</span>
        </div>
      </div>

      {/* Subscriber Information */}
      <div className="py-4 space-y-2.5 border-b border-border/60 text-xs">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <User className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{subscriber.name}</span>
        </div>

        <div className="text-muted-foreground truncate pl-5.5">{subscriber.email}</div>

        <div className="flex items-center gap-2 text-muted-foreground pt-1">
          <Calendar className="size-3.5 text-primary shrink-0" />
          <span>{tenure.displayText}</span>
        </div>
      </div>

      {/* Benefits checklist */}
      <div className="pt-4 mt-auto">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
          Benefícios Inclusos:
        </span>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          {plan.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-foreground/90">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selection State Bar */}
      <div
        className={cn(
          "mt-5 pt-3 border-t text-center text-xs font-bold transition-colors",
          isSelected
            ? "border-primary/20 text-primary"
            : "border-transparent text-muted-foreground",
        )}
      >
        {isSelected ? "✓ Assinatura Selecionada" : "Clique para selecionar"}
      </div>
    </Card>
  );
}

export default SubscriptionCard;
