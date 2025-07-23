import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kora - Gestione Squadre Sportive",
  description: "Piattaforma SaaS per la gestione di squadre sportive con AI coach integrato",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToasterProvider />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}