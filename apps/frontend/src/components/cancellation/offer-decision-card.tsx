"use client";

import { useState } from "react";
import type { Cancellation, Offer, Plan } from "@repo/contracts";
import { CheckCircle2, Gift, Loader2, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { acceptOffer, declineOffer } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

interface OfferDecisionCardProps {
  cancellation: Cancellation;
  plan: Plan;
  onResolved?: (offer: Offer, cancellation: Cancellation) => void;
}

export function OfferDecisionCard({ cancellation, plan, onResolved }: OfferDecisionCardProps) {
  const offer = cancellation.outcome?.offer;
  const [currentStatus, setCurrentStatus] = useState<string>(offer?.status || "PENDING");
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const discountAmount = offer?.amountCents ?? Math.round(plan.priceCents * 0.2);
  const newPriceCents = Math.max(0, plan.priceCents - discountAmount);

  const handleAccept = async () => {
    setIsLoading(true);
    setActionError("");
    try {
      const res = await acceptOffer(cancellation.id);
      setCurrentStatus("ACCEPTED");
      onResolved?.(res.offer, res.cancellation);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao aceitar a oferta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    setActionError("");
    try {
      const res = await declineOffer(cancellation.id);
      setCurrentStatus("DECLINED");
      onResolved?.(res.offer, res.cancellation);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Falha ao recusar a oferta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-2 border-primary/30 bg-gradient-to-b from-primary/[0.05] via-card to-card p-6 sm:p-8 shadow-md space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
          <Gift className="size-4" />
          Proposta Exclusiva de Retenção Claro
        </div>

        <Badge
          variant={
            currentStatus === "ACCEPTED"
              ? "success"
              : currentStatus === "DECLINED"
                ? "outline"
                : "highlight"
          }
          className="text-xs font-bold"
        >
          {currentStatus === "ACCEPTED"
            ? "Oferta Aceita"
            : currentStatus === "DECLINED"
              ? "Oferta Recusada"
              : "Aguardando Decisão"}
        </Badge>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Que tal continuar com a Claro com um desconto especial?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Reconhecemos sua importância como cliente e preparamos uma condição diferenciada para você
          manter todos os benefícios do plano <strong>{plan.name}</strong> por um valor reduzido.
        </p>
      </div>

      {/* Pricing Comparison Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-sm">
        <div>
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block">
            Valor Original
          </span>
          <span className="font-heading text-lg font-bold text-muted-foreground line-through">
            {formatCurrency(plan.priceCents)}/mês
          </span>
        </div>

        <div className="hidden sm:block h-10 w-px bg-border" />

        <div>
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="size-3.5" />
            Desconto Especial
          </span>
          <span className="font-heading text-lg font-black text-emerald-600">
            - {formatCurrency(discountAmount)}/mês
          </span>
        </div>

        <div className="hidden sm:block h-10 w-px bg-border" />

        <div className="sm:text-right">
          <span className="text-xs text-primary font-bold uppercase tracking-wider block">
            Novo Valor Mensal
          </span>
          <span className="font-heading text-2xl sm:text-3xl font-black text-primary">
            {formatCurrency(newPriceCents)}
            <span className="text-xs text-muted-foreground font-medium">/mês</span>
          </span>
        </div>
      </div>

      {actionError && <p className="text-xs font-semibold text-destructive">{actionError}</p>}

      {/* Decision State Messages & Buttons */}
      {currentStatus === "ACCEPTED" ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong>Oferta aceita com sucesso!</strong> Seu desconto já foi aplicado nas próximas
            faturas e sua assinatura continua ativa com todos os benefícios.
          </div>
        </div>
      ) : currentStatus === "DECLINED" ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/60 text-muted-foreground border border-border">
          <XCircle className="size-5 text-muted-foreground shrink-0" />
          <div className="text-xs">
            <strong>Oferta recusada.</strong> Sua solicitação de cancelamento foi concluída e o
            plano não será renovado ao fim do período faturado.
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleDecline}
            className="w-full sm:w-auto rounded-full text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            {isLoading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
            Recusar Oferta e Cancelar
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={handleAccept}
            className="w-full sm:w-auto rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 gap-2 text-xs sm:text-sm px-6"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            <span>Aceitar Oferta e Manter Plano</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

export default OfferDecisionCard;
