import type { Plan, Subscriber, Subscription } from "@repo/contracts";
import { AlertTriangle, Calendar, CreditCard, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { calculateTenure, formatCurrency } from "@/lib/formatters";

interface SubscriptionSummaryCardProps {
  item: {
    subscription: Subscription;
    subscriber: Subscriber;
    plan: Plan;
  };
}

export function SubscriptionSummaryCard({ item }: SubscriptionSummaryCardProps) {
  const { subscription, subscriber, plan } = item;
  const tenure = calculateTenure(subscription.startedAt);

  return (
    <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              {plan.cycle === "MONTHLY" ? "Assinatura Mensal" : "Assinatura Anual"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-heading text-xl sm:text-2xl font-black text-primary">
            {formatCurrency(plan.priceCents)}
          </span>
          <span className="text-xs text-muted-foreground block">/ mês</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="size-3.5 text-muted-foreground" />
          <span>
            Titular: <strong className="text-foreground">{subscriber.name}</strong> (
            {subscriber.email})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-primary" />
          <span>{tenure.displayText}</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
        <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Aviso importante:</strong> Você está solicitando o cancelamento do plano acima.
          Caso o cancelamento seja concluído, o acesso continuará disponível até o fim do ciclo
          atual faturado.
        </p>
      </div>
    </Card>
  );
}

export default SubscriptionSummaryCard;
