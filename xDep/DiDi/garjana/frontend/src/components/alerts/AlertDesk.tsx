'use client'

import { useState, useEffect } from 'react'
import { api, type Alert } from '@/lib/api'
import TierBadge from '@/components/TierBadge'

const HAZARD_LABELS: Record<string, string> = {
  lightning: 'Lightning',
  heavy_rain: 'Heavy Rain',
  extreme_rain: 'Extreme Rain',
  hail: 'Hail',
  wind: 'Wind Gust',
}

export default function AlertDesk() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)

  const refresh = () => {
    api.alerts()
      .then(data => setAlerts(data.alerts))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleApprove = async (id: string) => {
    await api.approveAlert(id)
    refresh()
  }

  const handleDismiss = async (id: string) => {
    await api.dismissAlert(id, 'Not operationally relevant')
    refresh()
  }

  const drafts = alerts.filter(a => a.status === 'draft')
  const approved = alerts.filter(a => a.status === 'approved')
  const dismissed = alerts.filter(a => a.status === 'dismissed')

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-g-text-muted text-sm">Loading alert queue...</div>
      </div>
    )
  }

  const selected = alerts.find(a => a.alert_id === selectedAlert)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Alert list */}
      <div className="w-96 border-r border-g-border overflow-y-auto">
        {/* Draft queue */}
        <div className="p-4 border-b border-g-border">
          <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-g-amber animate-pulse" />
            Draft Queue ({drafts.length})
          </div>
          {drafts.length === 0 ? (
            <div className="text-xs text-g-text-muted py-2">No pending drafts</div>
          ) : (
            <div className="space-y-2">
              {drafts.map(a => (
                <button
                  key={a.alert_id}
                  onClick={() => setSelectedAlert(a.alert_id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAlert === a.alert_id
                      ? 'border-g-accent bg-g-accent/5'
                      : 'border-g-border hover:border-g-border-light hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{HAZARD_LABELS[a.hazard] || a.hazard}</span>
                    <TierBadge tier={a.validation_tier} />
                  </div>
                  <div className="text-[10px] text-g-text-muted mt-1 font-mono tnum">
                    {a.alert_id} · {new Date(a.issued).toLocaleTimeString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Approved */}
        {approved.length > 0 && (
          <div className="p-4 border-b border-g-border">
            <div className="text-[10px] uppercase tracking-widest text-g-emerald mb-3">
              Approved ({approved.length})
            </div>
            <div className="space-y-2">
              {approved.map(a => (
                <div key={a.alert_id} className="p-3 rounded-lg border border-g-emerald/20 bg-g-emerald/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{HAZARD_LABELS[a.hazard] || a.hazard}</span>
                    <span className="text-[9px] text-g-emerald">APPROVED</span>
                  </div>
                  <div className="text-[10px] text-g-text-muted mt-1 font-mono tnum">{a.alert_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dismissed */}
        {dismissed.length > 0 && (
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-3">
              Dismissed ({dismissed.length})
            </div>
            <div className="space-y-2">
              {dismissed.map(a => (
                <div key={a.alert_id} className="p-3 rounded-lg border border-g-border opacity-50">
                  <span className="text-sm">{HAZARD_LABELS[a.hazard] || a.hazard}</span>
                  <div className="text-[10px] text-g-text-muted mt-1 font-mono tnum">{a.alert_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alert detail */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <div className="text-g-text-dim text-sm">Select an alert to review</div>
              <div className="text-g-text-muted text-xs mt-1">R10: All alerts require human approval before issuance</div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{HAZARD_LABELS[selected.hazard] || selected.hazard} Alert</h2>
                <div className="flex items-center gap-3 mt-2">
                  <TierBadge tier={selected.validation_tier} />
                  <span className="text-xs text-g-text-muted font-mono tnum">{selected.alert_id}</span>
                </div>
              </div>
              <div className={`text-[10px] uppercase tracking-widest font-medium px-3 py-1.5 rounded-full ${
                selected.status === 'draft' ? 'bg-g-amber/10 text-g-amber border border-g-amber/20' :
                selected.status === 'approved' ? 'bg-g-emerald/10 text-g-emerald border border-g-emerald/20' :
                'bg-white/5 text-g-text-muted border border-white/10'
              }`}>
                {selected.status}
              </div>
            </div>

            {/* Evidence */}
            <div className="glass-panel rounded-lg p-5 mb-4">
              <div className="text-[10px] uppercase tracking-widest text-g-text-muted mb-3">Alert Evidence</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-g-text-dim">Hazard Type</span>
                  <span>{HAZARD_LABELS[selected.hazard] || selected.hazard}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-g-text-dim">Validation Tier</span>
                  <span className="capitalize">{selected.validation_tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-g-text-dim">Issued</span>
                  <span className="font-mono tnum text-xs">{new Date(selected.issued).toISOString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-g-text-dim">Status</span>
                  <span className="capitalize">{selected.status}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selected.status === 'draft' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selected.alert_id)}
                  className="flex-1 py-2.5 rounded-lg bg-g-emerald/20 text-g-emerald border border-g-emerald/30 hover:bg-g-emerald/30 transition-colors text-sm font-medium"
                >
                  Approve Alert
                </button>
                <button
                  onClick={() => handleDismiss(selected.alert_id)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 text-g-text-dim border border-g-border hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
