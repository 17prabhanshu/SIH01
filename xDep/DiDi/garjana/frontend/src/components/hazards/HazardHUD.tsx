'use client'

import React from 'react'
import TierBadge from '@/components/TierBadge'

interface HazardData {
  hazard: string
  value: number
  unit: string
  validation_tier: string
}

interface HazardHUDProps {
  hazards: HazardData[]
}

export default function HazardHUD({ hazards }: HazardHUDProps) {
  if (!hazards || hazards.length === 0) {
    return (
      <div className="glass-panel p-3 w-56">
        <div className="text-sm text-g-dim">No active hazards</div>
      </div>
    )
  }

  const humanize = (str: string) => {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getSeverity = (value: number) => {
    if (value > 0.6) return { label: 'High', color: 'border-l-g-rose' }
    if (value >= 0.3) return { label: 'Medium', color: 'border-l-g-amber' }
    return { label: 'Low', color: 'border-l-g-dim' }
  }

  return (
    <div className="glass-panel p-3 w-56 flex flex-col gap-2">
      <div className="text-xs font-semibold text-g-dim uppercase tracking-wider mb-1">
        Hazard Warnings
      </div>
      {hazards.map((h, i) => {
        const severity = getSeverity(h.value)
        return (
          <div 
            key={i} 
            className={`flex flex-col justify-center px-3 py-2 border-l-4 ${severity.color} bg-g-bg/50 rounded-r-md`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-white truncate">
                {humanize(h.hazard)}
              </span>
              <TierBadge tier={h.validation_tier} size="xs" />
            </div>
            <div className="text-xs text-g-dim">
              Risk Level: {severity.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
