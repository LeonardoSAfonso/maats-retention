import type { Metadata } from "next";

import { Geist_Mono, Roboto, Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

import "./globals.css";

const montserratHeading = Montserrat({ subsets: ["latin"], variable: "--font-heading" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retenção Inteligente",
  description: "PoC de cancelamento com retenção inteligente - teste técnico Dev Sr Fullstack",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
