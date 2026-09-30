import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garjana (गर्जना) — Convective Nowcasting',
  description: 'Observability-aware convective-scale nowcasting system for India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-garjana-primary">
        {children}
      </body>
    </html>
  )
}
