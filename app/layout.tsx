import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniX Social — Agende. Publique. Cresça.",
  description: "Planeje e organize seus posts de Instagram, TikTok e YouTube em um só lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
