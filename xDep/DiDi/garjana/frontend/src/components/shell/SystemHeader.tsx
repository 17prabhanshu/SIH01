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
    LIVE: { text: 'text-g-emerald', dot: 'bg-g-emerald' },
    REPLAY: { text: 'text-g-amber', dot: 'bg-g-amber' },
    SYNTHETIC: { text: 'text-g-rose', dot: 'bg-g-rose' },
  }
  const mc = modeConfig[runMode] || { text: 'text-g-dim', dot: 'bg-g-dim' }

  const timestamp = health?.timestamp
    ? new Date(health.timestamp).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : 'Waiting for data...'

  const isConnected = !!health

  return (
    <div className="glass-panel rounded-none border-t-0 border-l-0 border-r-0 h-14 flex items-center px-6 w-full shrink-0 z-20 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-3 mr-6">
        <span className="text-base font-semibold text-white">Garjana Dashboard</span>
      </div>

      <div className="w-px h-6 bg-g-border mr-6" />

      {/* Mode */}
      <div className="flex items-center gap-2 mr-6">
        <div className={`w-2.5 h-2.5 rounded-full ${mc.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${mc.text}`}>{runMode}</span>
      </div>

      <span className="text-xs text-g-dim">
        {health?.system_mode ? `Mode: ${health.system_mode}` : ''}
      </span>

      <div className="flex-grow" />

      {/* Telemetry */}
      <div className="flex items-center gap-6">
        <span className="text-sm text-g-dim">{timestamp}</span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-g-dim uppercase tracking-wider">Active Storms</span>
          <span className="text-sm font-semibold">{stormCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-g-dim uppercase tracking-wider">Pending Alerts</span>
          <span className="text-sm font-semibold">{alertCount}</span>
        </div>

        {oi !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-g-dim uppercase tracking-wider">Data Quality</span>
            <span className="text-sm font-semibold">{(oi * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="w-px h-6 bg-g-border" />

        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-g-emerald' : 'bg-g-rose'}`} />
          <span className="text-xs text-g-dim">
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  )
}
