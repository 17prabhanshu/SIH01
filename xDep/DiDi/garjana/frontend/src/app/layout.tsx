import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garjana | Multi-Hazard Nowcasting Intelligence',
  description: 'Ministry of Earth Sciences PS-26084 — Convective-Scale Multi-Hazard Nowcasting System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  )
}
