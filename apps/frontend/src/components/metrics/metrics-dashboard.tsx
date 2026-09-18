"use client";

import { useState } from "react";
import Link from "next/link";
import type { MetricsResponse } from "@repo/contracts";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Headphones,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMetrics } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { EconomicImpactCard } from "./economic-impact-card";
import { MetricsKpiCard } from "./metrics-kpi-card";
import { RiskDistributionCard } from "./risk-distribution-card";

interface MetricsDashboardProps {
  initialMetrics: MetricsResponse;
}

export function MetricsDashboard({ initialMetrics }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<MetricsResponse>(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const refreshed = await getMetrics();
      setMetrics(refreshed);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Não foi possível atualizar os indicadores da PoC.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(lastUpdated);

  const retentionPercent = Math.round(metrics.retentionRate * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/80 shadow-sm">
        <div className="space-y-1.5">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-xs text-muted-foreground gap-1.5 -ml-2 mb-1",
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Voltar ao Autoatendimento</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-4" />
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Indicadores da PoC de Retenção Inteligente
            </h1>
          </div>

          <p className="text-xs text-muted-foreground">
            Métricas de desempenho da camada de IA Claro na redução de custos e resolução
            automatizada de cancelamentos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          <div className="text-[11px] text-muted-foreground">
            Última sincronização: <strong className="text-foreground">{formattedTime}</strong>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full text-xs font-semibold gap-2 border-border/80 hover:border-primary/50"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
            <span>{isRefreshing ? "Atualizando..." : "Atualizar Dados"}</span>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Falha na sincronização</strong>
            <span className="text-xs">{error}</span>
          </div>
        </Card>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsKpiCard
          title="Taxa de Resolução Automatizada"
          value={`${retentionPercent}%`}
          subtitle={`${metrics.automaticCancellations} de ${metrics.totalCancellations} casos resolvidos autonomamente`}
          icon={CheckCircle2}
          badgeText="Eficácia de IA"
          badgeVariant="success"
          accentColor="emerald"
        />

        <MetricsKpiCard
          title="Custo Operacional Evitado"
          value={formatCurrency(metrics.avoidedCostCents)}
          subtitle="Economia direta em chamadas de retenção humana"
          icon={DollarSign}
          badgeText="Economia Líquida"
          badgeVariant="success"
          accentColor="primary"
        />

        <MetricsKpiCard
          title="Cancelamentos Processados"
          value={metrics.totalCancellations}
          subtitle="Total de solicitações analisadas pelo pipeline de regras"
          icon={Sparkles}
          badgeText="Volume PoC"
          badgeVariant="secondary"
          accentColor="blue"
        />

        <MetricsKpiCard
          title="Retenções Humanas"
          value={metrics.humanRetentions}
          subtitle="Casos direcionados para operadores especialistas"
          icon={Headphones}
          badgeText="Zona Cinzenta / VIP"
          badgeVariant="warning"
          accentColor="amber"
        />
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <RiskDistributionCard
          riskDistribution={metrics.riskDistribution}
          totalCancellations={metrics.totalCancellations}
        />

        <EconomicImpactCard
          totalCancellations={metrics.totalCancellations}
          humanRetentions={metrics.humanRetentions}
          avoidedCostCents={metrics.avoidedCostCents}
        />
      </div>
    </div>
  );
}

export default MetricsDashboard;
