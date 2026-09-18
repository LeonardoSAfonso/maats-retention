"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, LogOut, ShieldCheck, User } from "lucide-react";
import { useSubscriberSession } from "@/contexts/subscriber-session-context";

export function ClaroHeader() {
  const router = useRouter();
  const { currentEmail, logout } = useSubscriberSession();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            aria-label="Minha Claro Início"
          >
            {/* Claro Logo Emblem */}
            <div className="relative flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-primary/30">
              <span className="font-heading text-lg font-black tracking-tighter">c</span>
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-black tracking-tight text-primary leading-none">
                claro
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Autoatendimento
              </span>
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-border sm:block" />

          <span className="hidden items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
            <ShieldCheck className="size-3.5 text-primary" />
            Ambiente Seguro
          </span>
        </div>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Menu principal">
          <Link
            href="/"
            className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/80"
          >
            Assinaturas
          </Link>

          <Link
            href="/metricas"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <BarChart3 className="size-3.5" />
            Métricas PoC
          </Link>

          <div className="hidden h-5 w-px bg-border sm:block" />

          {/* User status avatar & account switch */}
          {currentEmail ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                <User className="size-4" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-foreground leading-none max-w-[130px] truncate">
                  {currentEmail.split("@")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground max-w-[130px] truncate">
                  {currentEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                className="size-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-destructive transition-colors ml-1"
                aria-label="Sair da conta"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border">
                <User className="size-4 text-foreground/80" />
              </div>
              <span className="hidden text-xs font-medium text-muted-foreground md:inline">
                Identifique-se
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default ClaroHeader;
