import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricsDashboard } from "@/components/metrics/metrics-dashboard";
import { MetricsSkeleton } from "@/components/metrics/metrics-skeleton";
import { getMetrics } from "@/lib/api";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Métricas & Indicadores de Retenção | Minha Claro",
  description:
    "Painel executivo com indicadores de retenção, custos evitados e eficácia da camada de IA.",
};

async function MetricsContent() {
  let metrics = null;
  let error: string | null = null;

  try {
    metrics = await getMetrics();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Não foi possível carregar os indicadores da PoC.";
  }

  if (error || !metrics) {
    return (
      <div className="space-y-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "self-start gap-1.5 text-xs text-muted-foreground",
          )}
        >
          <ArrowLeft className="size-3.5" />
          Voltar ao Autoatendimento
        </Link>

        <Card className="rounded-3xl border-2 border-destructive/20 bg-card p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-foreground">
            Erro ao Carregar Indicadores
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error ||
              "O serviço de métricas está temporariamente indisponível. Verifique se o backend está ativo."}
          </p>
          <div className="pt-2">
            <Link
              href="/metricas"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full text-xs font-semibold px-6",
              )}
            >
              Tentar Novamente
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <MetricsDashboard initialMetrics={metrics} />;
}

export default function MetricasPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-start gap-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsContent />
      </Suspense>
    </main>
  );
}
