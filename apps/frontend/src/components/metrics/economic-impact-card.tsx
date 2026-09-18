import { HUMAN_RETENTION_COST_CENTS } from "@repo/contracts";
import { ArrowDownRight, Calculator, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

interface EconomicImpactCardProps {
  totalCancellations: number;
  humanRetentions: number;
  avoidedCostCents: number;
}

export function EconomicImpactCard({
  totalCancellations,
  humanRetentions,
  avoidedCostCents,
}: EconomicImpactCardProps) {
  const legacyTotalCostCents = totalCancellations * HUMAN_RETENTION_COST_CENTS;
  const currentActualCostCents = humanRetentions * HUMAN_RETENTION_COST_CENTS;
  const savingsPercent =
    legacyTotalCostCents > 0 ? Math.round((avoidedCostCents / legacyTotalCostCents) * 100) : 0;

  return (
    <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Retorno sobre o Investimento (ROI)
            </span>
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Modelo de Economia Operacional
          </h3>
        </div>

        <Badge variant="success" className="gap-1 font-bold text-xs self-start sm:self-auto">
          <ArrowDownRight className="size-3.5" />
          {savingsPercent}% de Redução de Custos
        </Badge>
      </div>

      {/* Comparison Columns: Legacy vs Claro AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legacy Model */}
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Modelo Anterior (Legado)
            </span>
            <Badge variant="outline" className="text-[10px]">
              Sem Camada de IA
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-heading text-2xl font-black text-foreground">
              {formatCurrency(legacyTotalCostCents)}
            </div>
            <p className="text-xs text-muted-foreground">
              100% dos {totalCancellations} cancelamentos eram transferidos para retenção humana ao
              custo de <strong>{formatCurrency(HUMAN_RETENTION_COST_CENTS)}</strong> por
              atendimento.
            </p>
          </div>

          <div className="pt-2 text-xs text-muted-foreground border-t border-border/60">
            Encaminhamentos humanos: <strong>{totalCancellations} chamadas</strong>
          </div>
        </div>

        {/* Current Smart Model */}
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.04] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              Com Retenção Inteligente Claro
            </span>
            <Badge variant="success" className="text-[10px] font-bold">
              PoC Ativa
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-heading text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(avoidedCostCents)}
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Economia direta gerada:</strong> O autoatendimento resolveu{" "}
              {totalCancellations - humanRetentions} casos autonomamente, eliminando custos de
              central.
            </p>
          </div>

          <div className="pt-2 text-xs text-muted-foreground border-t border-border/60 flex items-center justify-between">
            <span>
              Custo incorrido atual: <strong>{formatCurrency(currentActualCostCents)}</strong>
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              ({humanRetentions} casos humanos)
            </span>
          </div>
        </div>
      </div>

      {/* Formula Explanation Callout */}
      <div className="rounded-2xl bg-muted/40 border border-border/80 p-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Calculator className="size-4 text-primary" />
          <span>Fórmula de Cálculo Fixada pelo Contrato:</span>
        </div>
        <div className="font-mono bg-background/80 p-2.5 rounded-xl border border-border/60 text-[11px] text-foreground">
          avoidedCostCents = (totalCancellations - humanRetentions) × R$ 15,00
        </div>
        <div className="flex items-center gap-1.5 pt-1 text-[11px]">
          <TrendingUp className="size-3.5 text-primary" />
          <span>
            Valores computados dinamicamente a partir dos registros de cancelamento persistidos no
            banco de dados.
          </span>
        </div>
      </div>
    </Card>
  );
}

export default EconomicImpactCard;
