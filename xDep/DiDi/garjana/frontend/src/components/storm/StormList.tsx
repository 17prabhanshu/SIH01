'use client'

import React from 'react'
import type { Storm } from '@/lib/api'

interface StormListProps {
  storms: Storm[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function StormList({ storms, selectedId, onSelect }: StormListProps) {
  if (!storms || storms.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-g-dim">No active storms detected</div>
      </div>
    )
  }

  // Sort by zmax descending and limit to top 100 for performance
  const sorted = [...storms].sort((a, b) => b.zmax - a.zmax)
  const displayStorms = sorted.slice(0, 100)

  const getColor = (zmax: number) => {
    if (zmax >= 55) return 'bg-g-rose'
    if (zmax >= 45) return 'bg-g-orange'
    if (zmax >= 35) return 'bg-g-amber'
    return 'bg-g-accent'
  }

  return (
    <div className="flex flex-col">
      {storms.length > 100 && (
        <div className="p-2 text-[10px] uppercase tracking-widest text-center text-g-dim border-b border-g-border bg-g-bg/50">
          Showing top 100 of {storms.length} cells
        </div>
      )}
      {displayStorms.map(s => {
        const isSelected = selectedId === s.storm_id
        return (
          <button
            key={s.storm_id}
            onClick={() => onSelect(s.storm_id)}
            className={`flex items-center p-3 border-b border-g-border transition-colors text-left ${
              isSelected ? 'bg-g-border/30 border-l-4 border-l-g-accent' : 'hover:bg-g-border/20 border-l-4 border-l-transparent'
            }`}
          >
            <div className={`w-3 h-3 rounded-full mr-4 flex-shrink-0 ${getColor(s.zmax)}`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cell {s.storm_id.substring(s.storm_id.length - 6)}</span>
                <span className="text-sm font-semibold">{s.zmax.toFixed(1)} dBZ</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-g-dim">
                <span>{s.area_km2.toFixed(0)} sq km</span>
                <span>{s.centroid_lat.toFixed(2)}°, {s.centroid_lon.toFixed(2)}°</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
