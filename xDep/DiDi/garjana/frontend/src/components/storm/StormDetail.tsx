'use client'

import React from 'react';
import { Storm } from '@/lib/api';

interface StormDetailProps {
  storm: Storm | null;
}

export default function StormDetail({ storm }: StormDetailProps) {
  if (!storm) {
    return (
      <div className="glass-panel h-full flex items-center justify-center p-6">
        <p className="text-sm text-g-text-dim text-center">Select a storm cell to inspect</p>
      </div>
    );
  }

  const getIntensityColorText = (zmax: number) => {
    if (zmax < 35) return 'text-g-cyan';
    if (zmax < 45) return 'text-g-amber';
    if (zmax < 55) return 'text-orange-500';
    return 'text-g-rose';
  };

  const formattedTime = new Date(storm.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-g-text uppercase flex items-center gap-2">
          Cell <span className="font-mono text-g-accent">{storm.storm_id.slice(-6).toUpperCase()}</span>
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* ZMAX */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-g-text-dim">ZMax</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-mono font-bold ${getIntensityColorText(storm.zmax)}`}>
              {storm.zmax.toFixed(1)}
            </span>
            <span className="text-xs text-g-text-dim">dBZ</span>
          </div>
        </div>

        {/* AREA */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-g-text-dim">Area</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-g-text">
              {storm.area_km2.toFixed(0)}
            </span>
            <span className="text-xs text-g-text-dim">km²</span>
          </div>
        </div>

        {/* CENTROID */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-g-text-dim">Centroid</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-g-text">
              {storm.centroid_lat.toFixed(3)}°N, {storm.centroid_lon.toFixed(3)}°E
            </span>
          </div>
        </div>

        {/* TIMESTAMP */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-g-text-dim">Timestamp</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-mono font-bold text-g-text">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-white/10 my-1" />

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-g-text">Hazards</h4>
        <p className="text-[11px] text-g-text-dim">Run a forecast cycle to view hazard assessment</p>
      </div>
    </div>
  );
}
