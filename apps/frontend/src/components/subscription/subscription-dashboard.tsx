"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Plan, Subscriber, Subscription } from "@repo/contracts";
import { AlertCircle, LogOut, User } from "lucide-react";
import { SubscriberLogin } from "@/components/auth/subscriber-login";
import { Button } from "@/components/ui/button";
import { useSubscriberSession } from "@/contexts/subscriber-session-context";
import { SubscriptionHero } from "./subscription-hero";
import { SubscriptionSelector } from "./subscription-selector";
import { SubscriptionSkeleton } from "./subscription-skeleton";

interface SubscriptionItem {
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
}

interface SubscriptionDashboardProps {
  items: SubscriptionItem[];
}

export function SubscriptionDashboard({ items }: SubscriptionDashboardProps) {
  const router = useRouter();
  const { currentEmail, logout, isLoaded } = useSubscriberSession();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const userItems = useMemo(() => {
    if (!currentEmail) return [];
    return items.filter(
      (item) => item.subscriber.email.toLowerCase() === currentEmail.toLowerCase(),
    );
  }, [items, currentEmail]);

  if (!isLoaded) {
    return <SubscriptionSkeleton />;
  }

  if (!currentEmail) {
    return <SubscriberLogin />;
  }

  const subscriber = userItems[0]?.subscriber;
  const subscriberName = subscriber?.name || currentEmail.split("@")[0] || "Assinante";

  return (
    <div className="space-y-6">
      {/* Customer Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            <User className="size-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">
              Assinante: <span className="text-primary">{subscriberName}</span>
            </div>
            <div className="text-xs text-muted-foreground">{currentEmail}</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="rounded-full text-xs gap-1.5 hover:border-destructive/40 hover:text-destructive transition-colors"
        >
          <LogOut className="size-3.5" />
          <span>Trocar de Conta</span>
        </Button>
      </div>

      <SubscriptionHero subscriberName={subscriberName} />

      {userItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card">
          <AlertCircle className="size-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-foreground">
            Nenhuma assinatura encontrada para este e-mail
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            O endereço <strong>{currentEmail}</strong> não possui assinaturas ativas cadastradas em
            nossa base de clientes.
          </p>
          <Button onClick={handleLogout} className="rounded-full text-xs font-semibold">
            Entrar com outro e-mail
          </Button>
        </div>
      ) : (
        <SubscriptionSelector items={userItems} />
      )}
    </div>
  );
}

export default SubscriptionDashboard;
