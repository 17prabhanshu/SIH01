'use client'

import React from 'react';
import { Storm } from '@/lib/api';

interface StormListProps {
  storms: Storm[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function StormList({ storms, selectedId, onSelect }: StormListProps) {
  if (!storms || storms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-g-text-dim text-center">No active cells detected</p>
      </div>
    );
  }

  const sortedStorms = [...storms].sort((a, b) => b.zmax - a.zmax);

  const getIntensityColor = (zmax: number) => {
    if (zmax < 35) return 'bg-g-cyan';
    if (zmax < 45) return 'bg-g-amber';
    if (zmax < 55) return 'bg-orange-500';
    return 'bg-g-rose';
  };

  return (
    <div className="flex flex-col gap-1 overflow-y-auto w-full h-full">
      {sortedStorms.map((storm) => {
        const isSelected = storm.storm_id === selectedId;
        return (
          <button
            key={storm.storm_id}
            onClick={() => onSelect(storm.storm_id)}
            className={`
              flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-sm transition-colors border-l-2
              ${isSelected ? 'bg-white/5 border-g-accent' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}
            `}
            style={{ minHeight: '44px' }}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getIntensityColor(storm.zmax)}`} />
            
            <div className="flex flex-col flex-grow min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-mono text-xs text-g-text truncate">
                  {storm.storm_id.slice(-6).toUpperCase()}
                </span>
                <span className="font-mono text-xs font-bold text-g-text whitespace-nowrap">
                  {storm.zmax.toFixed(1)} <span className="text-[10px] font-normal text-g-text-dim">dBZ</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center gap-2 mt-0.5">
                <span className="text-[11px] text-g-text-dim truncate">
                  {storm.area_km2.toFixed(0)} km²
                </span>
                <span className="text-[10px] text-g-text-muted truncate">
                  {storm.centroid_lat.toFixed(2)}, {storm.centroid_lon.toFixed(2)}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
