import { Button } from "@/components/ui/button";

const pronto = [
  "Next.js 16 (App Router) + React 19 + TypeScript estrito",
  "Tailwind CSS 4, shadcn/ui (estilo base-maia) e `@/components/ui/button`",
  "Contratos de domínio em `@repo/contracts` (pacote do monorepo, já compilado)",
  "Abas e rotas livres: a estrutura de telas do fluxo é decisão sua",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Teste técnico - Dev Sr Fullstack
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          Cancelamento com Retenção Inteligente
        </h1>
      </header>

      <p className="text-muted-foreground text-pretty">
        Este é o scaffold do frontend. Ele sobe, builda e passa no lint. O fluxo de cancelamento
        (telas de início, motivo, processamento e resultado) é o que você vai construir. A
        especificação completa está em <code className="font-mono text-foreground">TESTE.md</code> e
        os contratos em <code className="font-mono text-foreground">packages/contracts</code>, na
        raiz do repositório.
      </p>

      <section aria-labelledby="pronto" className="space-y-3">
        <h2 id="pronto" className="text-sm font-semibold uppercase tracking-wide">
          Já pronto
        </h2>
        <ul className="space-y-2">
          {pronto.map((item) => (
            <li key={item} className="text-muted-foreground flex gap-2 text-sm">
              <span aria-hidden="true" className="text-foreground">
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button render={<a href="http://localhost:3000/health" />}>Ver /health da API</Button>
        <Button variant="outline" render={<a href="https://nextjs.org/docs" />}>
          Documentação do Next.js
        </Button>
      </div>
    </main>
  );
}
