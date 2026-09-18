import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CancellationResult } from "@/components/cancellation/cancellation-result";
import { getCancellationById } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ResultadoPageProps {
  params: Promise<{
    subscriptionId: string;
    cancellationId: string;
  }>;
}

export async function generateMetadata({ params }: ResultadoPageProps): Promise<Metadata> {
  const { cancellationId } = await params;
  return {
    title: `Protocolo ${cancellationId.slice(0, 8)} | Minha Claro`,
    description: `Detalhes da solicitação de cancelamento de assinatura Claro`,
  };
}

export default async function ResultadoPage({ params }: ResultadoPageProps) {
  const { cancellationId } = await params;

  let detail = null;
  let fetchError: string | null = null;

  try {
    detail = await getCancellationById(cancellationId);
  } catch (err: unknown) {
    fetchError =
      err instanceof Error
        ? err.message
        : "Não foi possível carregar os detalhes do protocolo de cancelamento.";
  }

  if (fetchError || !detail) {
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
            Protocolo não localizado
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {fetchError || "O protocolo informado não foi encontrado em nosso sistema."}
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
      <CancellationResult
        cancellation={detail.cancellation}
        subscription={detail.subscription}
        subscriber={detail.subscriber}
        plan={detail.plan}
      />
    </main>
  );
}
