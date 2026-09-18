import { Bot, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CancellationProcessing() {
  return (
    <Card className="rounded-3xl border-2 border-primary/20 bg-card p-8 sm:p-12 shadow-lg text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Animated Pulse & Spinner */}
      <div className="relative mx-auto size-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
        <div className="relative size-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Bot className="size-3.5" />
          Análise Inteligente em Andamento
        </div>

        <h3 className="font-heading text-2xl font-black text-foreground tracking-tight">
          Processando sua Solicitação
        </h3>

        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Nossa camada de inteligência está avaliando seu histórico de uso, tempo de relacionamento
          e o motivo informado para determinar a melhor resolução para o seu caso.
        </p>
      </div>

      <div className="rounded-2xl bg-muted/40 border border-border/80 p-4 max-w-md mx-auto text-left space-y-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Etapas em execução no backend:</span>
        </div>
        <ul className="space-y-1.5 pl-5 list-disc">
          <li>Classificação canônica do motivo de cancelamento</li>
          <li>Cálculo de probabilidade de churn (Agente de Scoring)</li>
          <li>Aplicação das regras de negócio e checagem de ofertas</li>
        </ul>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
        <ShieldCheck className="size-4 text-emerald-600" />
        <span>Aguarde um instante, a resposta é síncrona</span>
      </div>
    </Card>
  );
}

export default CancellationProcessing;
