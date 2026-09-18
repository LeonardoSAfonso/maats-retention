import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CancellationWizard } from "@/components/cancellation/cancellation-wizard";
import { getSubscriptionById } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CancelarPageProps {
  params: Promise<{
    subscriptionId: string;
  }>;
}

export async function generateMetadata({ params }: CancelarPageProps): Promise<Metadata> {
  const { subscriptionId } = await params;
  return {
    title: `Cancelar Assinatura | Minha Claro`,
    description: `Solicitação de cancelamento para assinatura ${subscriptionId}`,
  };
}

export default async function CancelarPage({ params }: CancelarPageProps) {
  const { subscriptionId } = await params;

  let subscriptionData = null;
  let fetchError: string | null = null;

  try {
    subscriptionData = await getSubscriptionById(subscriptionId);
  } catch (err: unknown) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Não foi possível carregar os dados desta assinatura. Verifique o identificador e tente novamente.";
  }

  if (fetchError || !subscriptionData) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-6 px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "self-start gap-1.5 text-xs text-muted-foreground",
          )}
        >
          <ArrowLeft className="size-3.5" />
          Voltar às minhas assinaturas
        </Link>

        <Card className="rounded-3xl border-2 border-destructive/20 bg-card p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-black text-foreground">
            Assinatura não localizada
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {fetchError ||
              "A assinatura informada não existe ou não pôde ser consultada no momento."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full text-xs font-semibold px-6",
              )}
            >
              Voltar ao Autoatendimento
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-start gap-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <CancellationWizard
        subscription={subscriptionData.subscription}
        subscriber={subscriptionData.subscriber}
        plan={subscriptionData.plan}
      />
    </main>
  );
}
