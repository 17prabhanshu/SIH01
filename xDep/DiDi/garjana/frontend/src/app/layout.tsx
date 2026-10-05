import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GARJANA [CORE] // AUTONOMOUS ORCHESTRATION',
  description: 'Convective-scale multi-hazard nowcasting system driven by agentic orchestration.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050505] text-[#a3a3a3] overflow-hidden">
        {children}
      </body>
    </html>
  )
}
