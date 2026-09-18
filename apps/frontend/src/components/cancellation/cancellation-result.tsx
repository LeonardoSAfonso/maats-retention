"use client";

import Link from "next/link";
import {
  OutcomeType,
  ReasonCategory,
  RiskBand,
  type Cancellation,
  type Plan,
  type Subscriber,
  type Subscription,
} from "@repo/contracts";
import {
  ArrowLeft,
  CheckCircle2,
  Headphones,
  HelpCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateTenure, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { OfferDecisionCard } from "./offer-decision-card";

interface CancellationResultProps {
  cancellation: Cancellation;
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
}

const CATEGORY_LABELS: Record<ReasonCategory, string> = {
  [ReasonCategory.PRICE]: "Sensibilidade a Preço",
  [ReasonCategory.LACK_OF_USE]: "Falta de Uso / Viagem",
  [ReasonCategory.TECHNICAL_ISSUE]: "Problemas Técnicos",
  [ReasonCategory.COMPETITION]: "Migração para Concorrente",
  [ReasonCategory.OTHER]: "Outros Motivos",
};

const RISK_BAND_CONFIG: Record<
  RiskBand,
  { label: string; variant: "success" | "warning" | "highlight" }
> = {
  [RiskBand.LOW]: { label: "Baixo Risco de Churn", variant: "success" },
  [RiskBand.GREY]: { label: "Zona Cinzenta de Risco", variant: "warning" },
  [RiskBand.HIGH]: { label: "Alto Risco de Churn", variant: "highlight" },
};

function formatHumanReason(reason?: string): string {
  if (!reason) return "Encaminhado para especialista para análise de condições.";
  if (reason.includes("high recurring value")) {
    return "Assinatura de alto valor recorrente identificada em risco elevado. Encaminhado para especialista sênior de retenção.";
  }
  if (reason.includes("timeout")) {
    return "Tempo limite de análise automatizada excedido. Encaminhado preventivamente para análise humana sem interrupção do serviço.";
  }
  if (reason.includes("grey zone")) {
    return "Perfil de uso intermediário (zona cinzenta). Encaminhado para especialista para atendimento sob medida.";
  }
  return reason;
}

export function CancellationResult({
  cancellation,
  subscription,
  subscriber,
  plan,
}: CancellationResultProps) {
  const outcomeType = cancellation.outcome?.type || OutcomeType.CANCELLED;
  const band = cancellation.band ?? RiskBand.LOW;
  const bandInfo = RISK_BAND_CONFIG[band];
  const categoryLabel = cancellation.reasonCategory
    ? CATEGORY_LABELS[cancellation.reasonCategory]
    : "Não categorizado";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-xs text-muted-foreground gap-1.5",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar às Assinaturas</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-black">
            ✓
          </span>
          <span>Etapa 3 de 3: Resolução Concluída</span>
        </div>
      </div>

      {/* AI Analysis Summary Bar */}
      <Card className="rounded-3xl border border-border p-6 bg-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Resultado da Análise Inteligente Claro</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={bandInfo.variant} className="text-xs font-bold">
              {bandInfo.label}
            </Badge>

            {cancellation.risk !== undefined && cancellation.risk !== null && (
              <Badge variant="outline" className="text-xs font-semibold font-mono">
                Risco: {Math.round(cancellation.risk * 100)}%
              </Badge>
            )}

            <Badge variant="secondary" className="text-xs font-semibold">
              {categoryLabel}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block font-medium">Assinante:</span>
            <strong className="text-foreground text-sm font-bold truncate block">
              {subscriber.name}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Plano Avaliado:</span>
            <strong className="text-foreground text-sm font-bold truncate block">
              {plan.name}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Valor Atual:</span>
            <strong className="text-foreground text-sm font-bold font-mono">
              {formatCurrency(plan.priceCents)}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Tempo de Contrato:</span>
            <strong className="text-foreground text-sm font-bold">
              {calculateTenure(subscription.startedAt).displayText}
            </strong>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Protocolo:</span>
            <span className="font-mono text-xs text-muted-foreground truncate block">
              {cancellation.id}
            </span>
          </div>
        </div>
      </Card>

      {/* Outcome Specific Cards */}
      {outcomeType === OutcomeType.AUTOMATIC_OFFER ? (
        <OfferDecisionCard cancellation={cancellation} plan={plan} />
      ) : outcomeType === OutcomeType.HUMAN_RETENTION ? (
        <Card className="rounded-3xl border-2 border-amber-500/30 bg-card p-6 sm:p-10 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Headphones className="size-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                Encaminhamento para Especialista
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
                Atendimento Especializado Claro
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {formatHumanReason(cancellation.outcome?.humanReason)}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Para garantir que você receba o tratamento mais adequado ao seu perfil, um consultor
              da nossa equipe sênior foi acionado. Ele possui autonomia para negociar condições
              exclusivas, planos sob medida ou resolver eventuais insatisfações.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <PhoneCall className="size-5 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Central Telefônica
                  </span>
                  <span className="text-xs text-muted-foreground">Ligue grátis para 1052</span>
                </div>
              </div>
              <Badge variant="outline" className="font-bold">
                1052
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <HelpCircle className="size-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-foreground block">WhatsApp Oficial</span>
                  <span className="text-xs text-muted-foreground">Atendimento 24 horas</span>
                </div>
              </div>
              <Badge variant="outline" className="font-bold">
                (11) 99991-0621
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/80">
            <span className="text-xs text-muted-foreground">
              Seu plano continua ativo enquanto nosso time avalia seu caso.
            </span>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full text-xs font-semibold",
              )}
            >
              Voltar ao Início
            </Link>
          </div>
        </Card>
      ) : (
        /* OutcomeType.CANCELLED */
        <Card className="rounded-3xl border-2 border-emerald-500/30 bg-card p-6 sm:p-10 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-0.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Cancelamento Confirmado
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
                Assinatura Cancelada com Sucesso
              </h3>
            </div>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed">
            Sua solicitação de cancelamento para o plano <strong>{plan.name}</strong> foi processada
            e concluída diretamente pelo autoatendimento.
          </p>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>O que acontece a partir de agora:</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc">
              <li>Não haverá novas cobranças recorrentes nas próximas faturas.</li>
              <li>
                Você continua com acesso a todos os benefícios contratados até o final do ciclo
                faturado vigente.
              </li>
              <li>Você poderá reativar seu plano a qualquer momento pelo portal Minha Claro.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-border/80">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 text-xs sm:text-sm",
              )}
            >
              Voltar ao Autoatendimento
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CancellationResult;
