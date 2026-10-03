'use client'

import { useState, useEffect } from 'react'
import { api, type CycleResult } from '@/lib/api'

export default function ReplayPanel() {
  const [bundles, setBundles] = useState<string[]>([])
  const [selectedBundle, setSelectedBundle] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CycleResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.bundles()
      .then(data => {
        setBundles(data.bundles)
        if (data.bundles.length > 0) setSelectedBundle(data.bundles[0])
      })
      .catch(console.error)
  }, [])

  const runReplay = async () => {
    setRunning(true)
    setError(null)
    setResult(null)
    try {
      const res = await api.runReplay(selectedBundle)
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-1">Replay Engine</h2>
        <p className="text-xs text-g-text-muted mb-6">
          Execute forecast cycles from archived event bundles. All data is clearly labelled REPLAY.
        </p>

        {/* Bundle selector */}
        <div className="glass-panel rounded-lg p-5 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-3">Event Bundle</div>

          {bundles.length === 0 ? (
            <div className="text-sm text-g-text-muted">No replay bundles found in data/replay_bundles/</div>
          ) : (
            <div className="space-y-2 mb-4">
              {bundles.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBundle(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedBundle === b
                      ? 'border-g-accent bg-g-accent/5'
                      : 'border-g-border hover:border-g-border-light'
                  }`}
                >
                  <div className="font-mono text-sm">{b}</div>
                  <div className="text-[10px] text-g-text-muted mt-0.5">
                    {b.includes('SEVIR') ? 'SEVIR archived event · 24 radar + 24 satellite frames' :
                     b.includes('synthetic') ? 'Synthetic demo · 12 radar frames + pre-computed forecasts' :
                     'Replay bundle'}
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={runReplay}
            disabled={running || !selectedBundle}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
              running
                ? 'bg-g-accent/20 text-g-accent cursor-wait'
                : 'bg-g-accent text-white hover:bg-g-accent-dim'
            } disabled:opacity-50`}
          >
            {running ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-g-accent border-t-transparent rounded-full animate-spin" />
                Executing cycle...
              </span>
            ) : (
              'Execute Forecast Cycle'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-panel rounded-lg p-4 mb-6 border border-g-rose/30 bg-g-rose/5">
            <div className="text-sm text-g-rose">{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="glass-panel rounded-lg p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${result.status === 'completed' ? 'bg-g-emerald' : 'bg-g-rose'}`} />
              <div className="text-[10px] uppercase tracking-widest text-g-text-muted">
                Cycle {result.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-g-text-muted">Storms</div>
                <div className="text-metric tnum font-mono text-g-cyan">{result.num_storms}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-g-text-muted">Hazards</div>
                <div className="text-metric tnum font-mono text-g-amber">{result.num_hazards}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-g-text-muted">Alerts</div>
                <div className="text-metric tnum font-mono text-g-rose">{result.num_alerts}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-g-border/50 pb-2">
                <span className="text-g-text-dim">Cycle Time</span>
                <span className="font-mono tnum">{new Date(result.cycle_time).toISOString()}</span>
              </div>
              <div className="flex justify-between border-b border-g-border/50 pb-2">
                <span className="text-g-text-dim">Elapsed</span>
                <span className="font-mono tnum">{result.elapsed_seconds.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between border-b border-g-border/50 pb-2">
                <span className="text-g-text-dim">Mode</span>
                <span className="font-mono">{result.run_mode}</span>
              </div>
            </div>

            {/* Pipeline steps */}
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-2">Pipeline Steps</div>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(result.steps).map(([step, status]) => (
                  <div key={step} className="flex items-center gap-2 text-[11px] py-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      status === 'ok' ? 'bg-g-emerald' :
                      status.startsWith('skipped') ? 'bg-g-amber' :
                      'bg-g-text-muted'
                    }`} />
                    <span className="text-g-text-dim truncate">{step.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
