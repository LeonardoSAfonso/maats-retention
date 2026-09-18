"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Mail, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscriberSession } from "@/contexts/subscriber-session-context";
import { cn } from "@/lib/utils";

const DEMO_SCENARIOS = [
  {
    name: "Ana Costa",
    email: "ana@exemplo.com",
    plan: "Basic (R$ 29)",
    tag: "Baixo Risco",
    variant: "success" as const,
  },
  {
    name: "Bruno Lima",
    email: "bruno@exemplo.com",
    plan: "Standard (R$ 49)",
    tag: "Zona Cinzenta",
    variant: "warning" as const,
  },
  {
    name: "Carla Dias",
    email: "carla@exemplo.com",
    plan: "Basic (R$ 29)",
    tag: "Alto Risco / Oferta",
    variant: "highlight" as const,
  },
  {
    name: "Diego Reis",
    email: "diego@exemplo.com",
    plan: "Premium (R$ 199)",
    tag: "Alto Valor / Humano",
    variant: "highlight" as const,
  },
  {
    name: "Eva Souza",
    email: "eva@exemplo.com",
    plan: "Standard (R$ 49)",
    tag: "Timeout de Scoring",
    variant: "warning" as const,
  },
  {
    name: "Felipe Nunes",
    email: "felipe@exemplo.com",
    plan: "Premium (R$ 199)",
    tag: "Alto Valor / Baixo Risco",
    variant: "success" as const,
  },
  {
    name: "Gabriela Mendes",
    email: "gabriela@exemplo.com",
    plan: "Premium (R$ 199)",
    tag: "Alto Valor / Cinzenta",
    variant: "warning" as const,
  },
];

export function SubscriberLogin() {
  const { login } = useSubscriberSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showScenarios, setShowScenarios] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!clean) {
      setError("Por favor, informe seu e-mail cadastrado.");
      return;
    }
    if (!clean.includes("@") || !clean.includes(".")) {
      setError("Por favor, informe um endereço de e-mail válido.");
      return;
    }
    setError("");
    login(clean);
  };

  const handleSelectScenario = (scenarioEmail: string) => {
    setEmail(scenarioEmail);
    setError("");
    login(scenarioEmail);
  };

  return (
    <div className="mx-auto max-w-2xl py-6 sm:py-10">
      <Card className="rounded-3xl border-2 border-border/80 bg-card p-6 sm:p-10 shadow-lg">
        {/* Header Branding */}
        <div className="text-center space-y-3 pb-6 border-b border-border/60">
          <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/30 mb-1">
            <span className="font-heading text-2xl font-black">c</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Acesse seu Autoatendimento
          </h2>

          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Informe seu e-mail cadastrado para gerenciar suas assinaturas, consultar detalhes do seu
            plano ou solicitar o cancelamento seguro.
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="subscriber-email"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              E-mail do Assinante
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="subscriber-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="seu-email@exemplo.com"
                className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            {error && <p className="text-xs font-semibold text-destructive mt-1">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-sm shadow-md shadow-primary/25 gap-2"
          >
            <span>Acessar Minhas Assinaturas</span>
            <ArrowRight className="size-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Seus dados e planos estão protegidos por criptografia</span>
          </div>
        </form>

        {/* PoC Scenarios Accordion Toggle */}
        <div className="mt-8 pt-6 border-t border-border/80">
          <button
            type="button"
            onClick={() => setShowScenarios((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl hover:bg-muted/60 transition-colors text-left group cursor-pointer"
            aria-expanded={showScenarios}
            aria-controls="demo-scenarios-panel"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary flex items-center gap-1.5 transition-colors">
              <Sparkles className="size-3.5 text-primary" />
              Cenários de Demonstração (PoC)
            </span>
            <span className="text-xs text-primary font-semibold flex items-center gap-1">
              <span>{showScenarios ? "Ocultar cenários" : "Clique para testar"}</span>
              <ChevronDown
                className={cn(
                  "size-4 text-primary transition-transform duration-200",
                  showScenarios && "rotate-180",
                )}
              />
            </span>
          </button>

          {showScenarios && (
            <div
              id="demo-scenarios-panel"
              className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in duration-200"
            >
              {DEMO_SCENARIOS.map((sc) => (
                <button
                  key={sc.email}
                  type="button"
                  onClick={() => handleSelectScenario(sc.email)}
                  className="flex items-center justify-between gap-2 p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/70 hover:border-primary/50 text-left transition-all group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-primary shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {sc.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {sc.email}
                    </span>
                  </div>

                  <Badge variant={sc.variant} className="text-[10px] shrink-0">
                    {sc.tag}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default SubscriberLogin;
