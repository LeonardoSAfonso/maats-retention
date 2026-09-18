"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  assertUUIDv7,
  type Cancellation,
  type Plan,
  type Subscriber,
  type Subscription,
} from "@repo/contracts";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createCancellation } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CancellationProcessing } from "./cancellation-processing";
import { CancellationReasonForm } from "./cancellation-reason-form";
import { CancellationResult } from "./cancellation-result";
import { SubscriptionSummaryCard } from "./subscription-summary-card";

interface CancellationWizardProps {
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
  initialCancellation?: Cancellation;
}

type WizardStep = "FORM" | "PROCESSING" | "RESULT";

export function CancellationWizard({
  subscription,
  subscriber,
  plan,
  initialCancellation,
}: CancellationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(initialCancellation ? "RESULT" : "FORM");
  const [cancellation, setCancellation] = useState<Cancellation | null>(
    initialCancellation || null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReason = async (rawReason: string) => {
    setIsSubmitting(true);
    setError(null);
    setStep("PROCESSING");

    try {
      const response = await createCancellation({
        subscriptionId: assertUUIDv7(subscription.id),
        rawReason,
      });

      setCancellation(response.cancellation);
      setStep("RESULT");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Não foi possível processar a solicitação de cancelamento. Tente novamente.";
      setError(errorMessage);
      setStep("FORM");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/");
  };

  if (step === "PROCESSING") {
    return (
      <div className="py-8">
        <CancellationProcessing />
      </div>
    );
  }

  if (step === "RESULT" && cancellation) {
    return (
      <CancellationResult
        cancellation={cancellation}
        subscription={subscription}
        subscriber={subscriber}
        plan={plan}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Wizard Navigation & Progress Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-xs text-muted-foreground gap-1.5",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar às Assinaturas</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
            1
          </span>
          <span className="text-foreground font-bold">Etapa 1 de 2:</span>
          <span>Motivo do Cancelamento</span>
        </div>
      </div>

      {error && (
        <Card className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">Falha no processamento</strong>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Reason Form */}
        <div className="lg:col-span-7">
          <CancellationReasonForm
            onSubmit={handleSubmitReason}
            onCancel={handleBackToDashboard}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right Column: Subscription & Subscriber Details */}
        <div className="lg:col-span-5 space-y-6">
          <SubscriptionSummaryCard
            item={{
              subscription,
              subscriber,
              plan,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CancellationWizard;
