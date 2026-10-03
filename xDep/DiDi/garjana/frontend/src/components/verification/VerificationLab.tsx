'use client'

import { useState, useEffect, useMemo } from 'react'
import { api, type VerificationScores } from '@/lib/api'

export default function VerificationLab() {
  const [scores, setScores] = useState<VerificationScores | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'csi' | 'fss'>('csi')

  useEffect(() => {
    api.verification()
      .then(data => { if (data.scores?.results) setScores(data.scores) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = useMemo(() => {
    if (!scores?.results) return []
    return Object.entries(scores.results).map(([lead, vals]) => ({
      lead: lead.replace('+', '').replace('m', ''),
      leadMin: parseInt(lead.replace('+', '').replace('m', '')),
      csiExtrap: vals.csi_extrap_mean,
      csiPersist: vals.csi_persist_mean,
      fssExtrap: vals.fss_extrap_mean,
      csiLo: vals.csi_extrap_p025,
      csiHi: vals.csi_extrap_p975,
    })).sort((a, b) => a.leadMin - b.leadMin)
  }, [scores])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-g-text-muted text-sm">Loading verification scores...</div>
      </div>
    )
  }

  if (!scores || chartData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-g-text-muted text-sm">No verification data available</div>
          <div className="text-g-text-muted text-xs mt-1">Run `make baseline-eval` to generate scores</div>
        </div>
      </div>
    )
  }

  const maxVal = selectedMetric === 'csi' ? 1.0 : 1.0
  const barWidth = 100 / chartData.length

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Verification Laboratory</h2>
            <p className="text-xs text-g-text-muted mt-1">
              {scores.metadata.data_source} · {scores.metadata.n_seeds} seeds · {scores.metadata.motion_backend}
            </p>
          </div>
          <div className="flex gap-1">
            {(['csi', 'fss'] as const).map(m => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-medium rounded transition-colors
                  ${selectedMetric === m ? 'bg-g-accent text-white' : 'bg-g-surface text-g-text-dim hover:text-g-text'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="glass-panel rounded-lg p-6 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-4">
            {selectedMetric === 'csi' ? 'Critical Success Index' : 'Fractions Skill Score'} vs Lead Time
          </div>

          {/* SVG Chart */}
          <div className="relative h-64">
            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map(v => (
                <line key={v} x1="0" y1={200 - v * 200} x2="600" y2={200 - v * 200}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}

              {/* Confidence interval (CSI only) */}
              {selectedMetric === 'csi' && (
                <path
                  d={chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * 580 + 10
                    const yLo = 200 - (d.csiLo / maxVal) * 200
                    return `${i === 0 ? 'M' : 'L'} ${x} ${yLo}`
                  }).join(' ') + chartData.slice().reverse().map((d, i) => {
                    const x = ((chartData.length - 1 - i) / (chartData.length - 1)) * 580 + 10
                    const yHi = 200 - (d.csiHi / maxVal) * 200
                    return `L ${x} ${yHi}`
                  }).join(' ') + ' Z'}
                  fill="rgba(99,102,241,0.1)"
                />
              )}

              {/* Persistence line (CSI only) */}
              {selectedMetric === 'csi' && (
                <path
                  d={chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * 580 + 10
                    const y = 200 - (d.csiPersist / maxVal) * 200
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                  }).join(' ')}
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"
                />
              )}

              {/* Main line */}
              <path
                d={chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 580 + 10
                  const val = selectedMetric === 'csi' ? d.csiExtrap : d.fssExtrap
                  const y = 200 - (val / maxVal) * 200
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                }).join(' ')}
                fill="none" stroke="#6366f1" strokeWidth="2"
              />

              {/* Data points */}
              {chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 580 + 10
                const val = selectedMetric === 'csi' ? d.csiExtrap : d.fssExtrap
                const y = 200 - (val / maxVal) * 200
                return <circle key={i} cx={x} cy={y} r="3" fill="#6366f1" stroke="#0a0b0f" strokeWidth="1.5" />
              })}
            </svg>

            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[9px] text-g-text-muted tnum">
              <span>1.0</span>
              <span>0.5</span>
              <span>0.0</span>
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-[9px] text-g-text-muted tnum px-2">
            {chartData.filter((_, i) => i % 2 === 0).map(d => (
              <span key={d.lead}>+{d.lead}m</span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-4 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-g-accent rounded" />
              <span className="text-g-text-dim">Extrapolation (Garjana Baseline)</span>
            </div>
            {selectedMetric === 'csi' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-t border-dashed border-white/20" />
                  <span className="text-g-text-dim">Persistence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-g-accent/10 rounded" />
                  <span className="text-g-text-dim">95% CI</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Score Table */}
        <div className="glass-panel rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-g-border text-g-text-muted">
                <th className="text-left p-3 text-[10px] uppercase tracking-widest font-medium">Lead</th>
                <th className="text-right p-3 text-[10px] uppercase tracking-widest font-medium">CSI (Extrap)</th>
                <th className="text-right p-3 text-[10px] uppercase tracking-widest font-medium">CSI (Persist)</th>
                <th className="text-right p-3 text-[10px] uppercase tracking-widest font-medium">Skill Δ</th>
                <th className="text-right p-3 text-[10px] uppercase tracking-widest font-medium">FSS</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map(d => {
                const delta = d.csiExtrap - d.csiPersist
                return (
                  <tr key={d.lead} className="border-b border-g-border/50 hover:bg-white/[0.02]">
                    <td className="p-3 tnum font-mono text-g-text-dim">+{d.lead} min</td>
                    <td className="p-3 text-right tnum font-mono font-semibold">{d.csiExtrap.toFixed(3)}</td>
                    <td className="p-3 text-right tnum font-mono text-g-text-dim">{d.csiPersist.toFixed(3)}</td>
                    <td className={`p-3 text-right tnum font-mono ${delta > 0 ? 'text-g-emerald' : 'text-g-rose'}`}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(3)}
                    </td>
                    <td className="p-3 text-right tnum font-mono">{d.fssExtrap.toFixed(3)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
