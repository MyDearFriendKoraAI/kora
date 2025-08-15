import type { Metadata, Viewport } from "next";
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
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