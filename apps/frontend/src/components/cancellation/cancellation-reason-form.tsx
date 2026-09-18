"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CancellationReasonFormProps {
  onSubmit: (rawReason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const REASON_SUGGESTIONS = [
  {
    label: "Preço Alto",
    text: "O valor da mensalidade ficou muito caro para o meu orçamento atual.",
    category: "Preço",
  },
  {
    label: "Pouco Uso / Viagem",
    text: "Vou viajar pelos próximos meses e praticamente não estou usando o serviço.",
    category: "Uso",
  },
  {
    label: "Problemas Técnicos",
    text: "O aplicativo está travando com frequência e com erros técnicos constantes.",
    category: "Técnico",
  },
  {
    label: "Concorrência",
    text: "Decidi assinar uma plataforma concorrente com mais opções de catálogo.",
    category: "Concorrência",
  },
];

export function CancellationReasonForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: CancellationReasonFormProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reason.trim();
    if (clean.length < 3) {
      setError(
        "Por favor, descreva em poucas palavras o motivo da sua decisão (mínimo de 3 caracteres).",
      );
      return;
    }
    setError("");
    onSubmit(clean);
  };

  const handleApplySuggestion = (text: string) => {
    setReason(text);
    setError("");
  };

  return (
    <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
      <div className="space-y-2 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <h3 className="font-heading text-xl font-bold text-foreground">
            Conte-nos o motivo do cancelamento
          </h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Sua opinião é fundamental para compreendermos o que podemos melhorar. Descreva livremente
          o que motivou sua decisão.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="raw-reason"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Motivo da Solicitação (Texto Livre)
            </label>
            <span className="text-[11px] text-muted-foreground">{reason.length} caracteres</span>
          </div>

          <textarea
            id="raw-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="Exemplo: O valor da mensalidade pesou no orçamento, ou o aplicativo apresentou lentidão nos últimos dias..."
            className="w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
            disabled={isSubmitting}
            required
          />

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-2.5 rounded-2xl bg-muted/30 border border-border/60 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Sugestões Rápidas (Cenários do Teste):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REASON_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySuggestion(sug.text)}
                className="flex items-start gap-2 p-2.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-primary/40 text-left transition-all text-xs group cursor-pointer"
              >
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-foreground block group-hover:text-primary transition-colors">
                    {sug.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{sug.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-full text-xs font-semibold"
          >
            Desistir e Manter Assinatura
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || reason.trim().length < 3}
            className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 gap-2 text-xs sm:text-sm px-6"
          >
            <span>Confirmar Solicitação de Cancelamento</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default CancellationReasonForm;
