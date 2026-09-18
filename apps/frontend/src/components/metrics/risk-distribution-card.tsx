import { RiskBand } from "@repo/contracts";
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RiskDistributionCardProps {
  riskDistribution: Record<RiskBand, number>;
  totalCancellations: number;
}

export function RiskDistributionCard({
  riskDistribution,
  totalCancellations,
}: RiskDistributionCardProps) {
  const lowCount = riskDistribution[RiskBand.LOW] || 0;
  const greyCount = riskDistribution[RiskBand.GREY] || 0;
  const highCount = riskDistribution[RiskBand.HIGH] || 0;

  const lowPct = totalCancellations > 0 ? Math.round((lowCount / totalCancellations) * 100) : 0;
  const greyPct = totalCancellations > 0 ? Math.round((greyCount / totalCancellations) * 100) : 0;
  const highPct = totalCancellations > 0 ? Math.round((highCount / totalCancellations) * 100) : 0;

  return (
    <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inteligência de Churn
            </span>
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">
            Distribuição por Faixa de Risco
          </h3>
        </div>

        <Badge variant="outline" className="font-mono text-xs font-bold self-start sm:self-auto">
          Total: {totalCancellations} casos analisados
        </Badge>
      </div>

      {/* Multi-segment visual progress bar */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-muted/60 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${lowPct}%` }}
            className="bg-emerald-500 hover:bg-emerald-600 transition-all duration-500 relative group"
            title={`Baixo Risco: ${lowPct}% (${lowCount} casos)`}
          />
          <div
            style={{ width: `${greyPct}%` }}
            className="bg-amber-400 hover:bg-amber-500 transition-all duration-500 relative group"
            title={`Zona Cinzenta: ${greyPct}% (${greyCount} casos)`}
          />
          <div
            style={{ width: `${highPct}%` }}
            className="bg-blue-500 hover:bg-blue-600 transition-all duration-500 relative group"
            title={`Alto Risco: ${highPct}% (${highCount} casos)`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground px-1">
          <span>0%</span>
          <span>Proporção Acumulada</span>
          <span>100%</span>
        </div>
      </div>

      {/* 3 Detailed Risk Bands */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Low Risk */}
        <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Baixo Risco (LOW)</span>
            </div>
            <Badge variant="success" className="font-mono font-bold text-xs">
              {lowPct}%
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-heading text-2xl font-black text-foreground">
              {lowCount} <span className="text-xs font-normal text-muted-foreground">casos</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Risco &lt; 30%. O cancelamento é concluído de imediato no autoatendimento sem custo
              adicional de retenção.
            </p>
          </div>
        </div>

        {/* Grey Zone */}
        <div className="rounded-2xl border-2 border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <AlertCircle className="size-4 text-amber-600" />
              <span>Zona Cinzenta (GREY)</span>
            </div>
            <Badge variant="warning" className="font-mono font-bold text-xs">
              {greyPct}%
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-heading text-2xl font-black text-foreground">
              {greyCount} <span className="text-xs font-normal text-muted-foreground">casos</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Risco entre 30% e 70% ou timeout. Encaminhado preventivamente para especialista de
              retenção humana.
            </p>
          </div>
        </div>

        {/* High Risk */}
        <div className="rounded-2xl border-2 border-blue-500/20 bg-blue-500/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
              <ShieldAlert className="size-4 text-blue-600" />
              <span>Alto Risco (HIGH)</span>
            </div>
            <Badge variant="highlight" className="font-mono font-bold text-xs">
              {highPct}%
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="font-heading text-2xl font-black text-foreground">
              {highCount} <span className="text-xs font-normal text-muted-foreground">casos</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Risco &gt; 70%. Apresenta oferta automática de retenção com desconto, exceto planos de
              alto valor (top 20%).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-muted/40 border border-border/80 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
        <UserCheck className="size-4 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Regra de Negócio de Alto Valor:</strong> Assinaturas no percentil superior de
          mensalidade (top 20%) têm a oferta automática interceptada e são transferidas para um
          atendente sênior para evitar cancelamento inadvertido de clientes estratégicos.
        </span>
      </div>
    </Card>
  );
}

export default RiskDistributionCard;
