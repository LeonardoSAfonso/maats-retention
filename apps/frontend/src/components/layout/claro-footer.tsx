import { HelpCircle, PhoneCall, ShieldAlert } from "lucide-react";

export function ClaroFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30 py-8 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-black tracking-tight text-primary">
              claro
            </span>
            <span className="text-xs font-normal">| Central de Autoatendimento ao Assinante</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <PhoneCall className="size-3.5 text-primary" />
              Central: <strong>1052</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-primary" />
              WhatsApp: <strong>(11) 99991-0621</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-primary" />
              Cancelamento Seguro
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>
            © {new Date().getFullYear()} Claro S.A. Todos os direitos reservados. PoC de Retenção
            Inteligente com IA.
          </p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Termos de Uso</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacidade & Dados</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Regulamento dos Planos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default ClaroFooter;
