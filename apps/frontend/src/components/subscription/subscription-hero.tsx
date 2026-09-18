import { Layers } from "lucide-react";

interface SubscriptionHeroProps {
  subscriberName?: string;
}

export function SubscriptionHero({ subscriberName }: SubscriptionHeroProps = {}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-6 sm:p-8 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            <Layers className="size-3.5" />
            Etapa 1 de 3: Identificação do Plano
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
            {subscriberName ? `Olá, ${subscriberName}!` : "Gerenciamento de Assinaturas"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {subscriberName
              ? "Esta é a sua assinatura ativa na Claro. Confira os benefícios inclusos, tempo de casa e o valor vigente antes de solicitar qualquer alteração."
              : "Selecione abaixo a assinatura que você deseja consultar ou gerenciar. Confira os benefícios inclusos, tempo de relacionamento e o valor vigente antes de solicitar qualquer alteração."}
          </p>
        </div>

        {/* Stepper visual */}
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border p-3 rounded-2xl shrink-0 self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-black">
              1
            </span>
            <span>Seleção</span>
          </div>

          <span className="h-0.5 w-4 bg-border" />

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              2
            </span>
            <span>Motivo</span>
          </div>

          <span className="h-0.5 w-4 bg-border" />

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
              3
            </span>
            <span>Resolução</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SubscriptionHero;
