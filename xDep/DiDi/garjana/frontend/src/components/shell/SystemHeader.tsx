'use client'

import { type HealthData } from '@/lib/api'

interface SystemHeaderProps {
  health: HealthData | null
  stormCount: number
  alertCount: number
  oi: number | null
}

export default function SystemHeader({ health, stormCount, alertCount, oi }: SystemHeaderProps) {
  const runMode = health?.run_mode?.toUpperCase() || 'CONNECTING'

  const modeConfig: Record<string, { text: string; dot: string }> = {
    LIVE: { text: 'text-g-emerald', dot: 'bg-g-emerald shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
    REPLAY: { text: 'text-g-amber', dot: 'bg-g-amber shadow-[0_0_8px_rgba(245,158,11,0.6)]' },
    SYNTHETIC: { text: 'text-g-rose', dot: 'bg-g-rose shadow-[0_0_8px_rgba(244,63,94,0.6)]' },
  }
  const mc = modeConfig[runMode] || { text: 'text-g-text-dim', dot: 'bg-g-text-muted' }

  const timestamp = health?.timestamp
    ? new Date(health.timestamp).toISOString().substring(11, 19) + ' UTC'
    : '--:--:-- UTC'

  const isConnected = !!health

  return (
    <div className="glass-panel h-12 flex items-center px-5 border-b border-g-border w-full shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <span className="text-sm font-bold tracking-[0.2em] text-white">GARJANA</span>
        <span className="text-g-accent">⚡</span>
      </div>

      <div className="w-px h-5 bg-g-border mr-4" />

      {/* Mode */}
      <div className="flex items-center gap-2 mr-4">
        <div className={`w-2 h-2 rounded-full animate-pulse ${mc.dot}`} />
        <span className={`text-[10px] font-semibold tracking-[0.15em] ${mc.text}`}>{runMode}</span>
      </div>

      <span className="text-[10px] tracking-[0.15em] text-g-text-muted font-medium">
        {health?.system_mode || 'BASELINE'}
      </span>

      <div className="flex-grow" />

      {/* Telemetry */}
      <div className="flex items-center gap-3">
        <span className="font-mono tnum text-xs text-g-text-dim">{timestamp}</span>

        <div className="w-px h-4 bg-g-border" />

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-g-surface border border-g-border">
          <span className="font-mono tnum text-sm text-g-cyan font-semibold">{stormCount}</span>
          <span className="text-[9px] uppercase tracking-widest text-g-text-muted">cells</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-g-surface border border-g-border">
          <span className="font-mono tnum text-sm text-g-amber font-semibold">{alertCount}</span>
          <span className="text-[9px] uppercase tracking-widest text-g-text-muted">drafts</span>
        </div>

        {oi !== null && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-g-surface border border-g-border">
            <span className="text-[9px] uppercase tracking-widest text-g-text-muted">OI</span>
            <span className="font-mono tnum text-sm text-g-accent font-semibold">{(oi * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="w-px h-4 bg-g-border" />

        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-g-emerald shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-g-rose'}`} />
          <span className="text-[9px] uppercase tracking-widest text-g-text-muted">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
