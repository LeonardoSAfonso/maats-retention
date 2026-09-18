import type { Metadata } from "next";

import { Geist_Mono, Montserrat, Roboto } from "next/font/google";
import { SubscriberSessionProvider } from "@/contexts/subscriber-session-context";
import { ClaroFooter } from "@/components/layout/claro-footer";
import { ClaroHeader } from "@/components/layout/claro-header";
import { cn } from "@/lib/utils";

import "./globals.css";

const montserratHeading = Montserrat({ subsets: ["latin"], variable: "--font-heading" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minha Claro - Gestão de Assinaturas e Cancelamento",
  description: "Portal de autoatendimento Minha Claro - PoC de Retenção Inteligente",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        roboto.variable,
        montserratHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 text-foreground">
        <SubscriberSessionProvider>
          <ClaroHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <ClaroFooter />
        </SubscriberSessionProvider>
      </body>
    </html>
  );
}
