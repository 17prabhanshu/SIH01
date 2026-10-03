'use client'

import React from 'react'
import type { Storm } from '@/lib/api'

interface StormDetailProps {
  storm: Storm | null
}

export default function StormDetail({ storm }: StormDetailProps) {
  if (!storm) {
    return (
      <div className="p-6 text-center text-sm text-g-dim">
        Select a storm cell to view details
      </div>
    )
  }

  const getColor = (zmax: number) => {
    if (zmax >= 55) return 'text-g-rose'
    if (zmax >= 45) return 'text-g-orange'
    if (zmax >= 35) return 'text-g-amber'
    return 'text-g-accent'
  }

  return (
    <div className="flex flex-col bg-g-surface">
      <div className="p-4 border-b border-g-border">
        <div className="text-xs text-g-dim mb-1">STORM CELL</div>
        <div className="text-lg font-semibold">{storm.storm_id}</div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-g-border">
          <span className="text-sm text-g-dim">Peak Intensity</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-semibold ${getColor(storm.zmax)}`}>{storm.zmax.toFixed(1)}</span>
            <span className="text-xs text-g-dim">dBZ</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-g-border">
          <span className="text-sm text-g-dim">Storm Size</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">{storm.area_km2.toFixed(0)}</span>
            <span className="text-xs text-g-dim">sq km</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-g-border">
          <span className="text-sm text-g-dim">Location</span>
          <div className="text-sm font-medium">
            {storm.centroid_lat.toFixed(3)}°N, {storm.centroid_lon.toFixed(3)}°E
          </div>
        </div>

        {storm.timestamp && (
          <div className="flex items-center justify-between p-4 border-b border-g-border">
            <span className="text-sm text-g-dim">Last Updated</span>
            <div className="text-sm font-medium">
              {new Date(storm.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-g-bg">
        <div className="text-xs font-semibold mb-2">Hazards</div>
        <div className="text-sm text-g-dim">
          Run a forecast simulation to view hazard assessments for this cell.
        </div>
      </div>
    </div>
  )
}
