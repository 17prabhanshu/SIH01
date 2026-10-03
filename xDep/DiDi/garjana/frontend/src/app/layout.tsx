import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GARJANA — Convective Nowcasting Intelligence',
  description: 'Observability-aware convective-scale multi-hazard nowcasting system for India. SIH 2026 / MoES / PS 26084.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-g-bg text-g-text overflow-hidden">
        {children}
      </body>
    </html>
  )
}
