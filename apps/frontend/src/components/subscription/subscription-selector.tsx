"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Plan, Subscriber, Subscription } from "@repo/contracts";
import { AlertCircle, ArrowRight, CheckCircle, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { SubscriptionCard } from "./subscription-card";

interface SubscriptionItem {
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
}

interface SubscriptionSelectorProps {
  items: SubscriptionItem[];
}

export function SubscriptionSelector({ items }: SubscriptionSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string>(items[0]?.subscription.id ?? "");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }
    const query = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.subscriber.name.toLowerCase().includes(query) ||
        item.subscriber.email.toLowerCase().includes(query) ||
        item.plan.name.toLowerCase().includes(query),
    );
  }, [items, searchTerm]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.subscription.id === selectedId) || null;
  }, [items, selectedId]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-12 text-center">
        <AlertCircle className="size-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-heading text-lg font-bold text-foreground">
          Nenhuma assinatura ativa encontrada
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Não identificamos assinaturas elegíveis para cancelamento no momento. Se você acredita que
          isto é um erro, consulte o suporte Claro pelo 1052.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por assinante ou plano (ex: Ana, Premium)..."
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            aria-label="Filtrar assinaturas"
          />
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
          Exibindo <strong>{filteredItems.length}</strong> de {items.length} assinaturas ativas
        </div>
      </div>

      {/* Subscription Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma assinatura encontrada para o filtro <strong>&quot;{searchTerm}&quot;</strong>.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="mt-3 text-xs"
          >
            Limpar filtro
          </Button>
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Lista de assinaturas ativas"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item) => (
            <SubscriptionCard
              key={item.subscription.id}
              item={item}
              isSelected={item.subscription.id === selectedId}
              onSelect={() => setSelectedId(item.subscription.id)}
            />
          ))}
        </div>
      )}

      {/* Selected Subscription Action Panel */}
      {selectedItem && (
        <div className="sticky bottom-6 z-30 rounded-3xl border-2 border-primary/20 bg-background/95 p-6 shadow-xl backdrop-blur-md transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  ✓
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Plano Selecionado para Gerenciamento
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {selectedItem.plan.name}
                </h3>
                <span className="text-sm font-semibold text-muted-foreground">
                  ({selectedItem.subscriber.name})
                </span>
                <span className="text-sm font-black text-primary">
                  {formatCurrency(selectedItem.plan.priceCents)}/mês
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Na próxima etapa, solicitaremos o motivo da sua decisão para analisarmos possíveis
                vantagens ou darmos andamento ao cancelamento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                className="rounded-full text-xs font-semibold"
                onClick={() => {
                  alert(
                    `Excelente! Sua assinatura ${selectedItem.plan.name} continua ativa com todos os benefícios.`,
                  );
                }}
              >
                <CheckCircle className="size-3.5 text-emerald-600 mr-1.5" />
                Manter Assinatura
              </Button>

              <Link
                href={`/cancelar/${selectedItem.subscription.id}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 gap-2 px-5 py-2.5 text-xs sm:text-sm",
                )}
              >
                <span>Prosseguir para Cancelamento</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionSelector;
