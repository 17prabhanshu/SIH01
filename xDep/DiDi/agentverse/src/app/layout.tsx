import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

const syne = Syne({ subsets: ["latin"], variable: "--font-heading" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tecrese.com'),
  title: {
    template: "%s | Tecrese",
    default: "Tecrese - Discover AI Agents and Tools",
  },
  description: "The premier platform for discovering, building, and learning about AI agents, tools, and the models that power them.",
  openGraph: {
    title: "Tecrese",
    description: "The premier platform for discovering, building, and learning about AI agents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tecrese",
    description: "The premier platform for discovering, building, and learning about AI agents",
  },
};

import { Providers } from "@/components/providers";
import { PixelCat } from "@/components/animations/pixel-cat";
import { CookieBanner } from "@/components/layout/cookie-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider defaultTheme="system" storageKey="agentverse-theme">
          <Providers>
            <PixelCat />
            {children}
            <CookieBanner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
