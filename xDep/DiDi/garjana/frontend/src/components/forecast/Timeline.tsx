'use client'

import React from 'react';

interface TimelineProps {
  selectedLead: number;
  onLeadChange: (lead: number) => void;
  frames?: Array<{ lead_min: number; mean_dbz: number }>;
}

export default function Timeline({ selectedLead, onLeadChange, frames = [] }: TimelineProps) {
  const min = -60;
  const max = 120;
  const step = 10;
  
  const getLabel = (val: number) => {
    if (val === 0) return 'NOW';
    if (val < 0) return `${val}`;
    return `+${val}`;
  };

  const getDisplayValue = (val: number) => {
    if (val === 0) return 'NOW';
    if (val < 0) return `${val} min (obs)`;
    return `+${val} min`;
  };

  const selectedFrame = frames.find(f => f.lead_min === selectedLead);

  return (
    <div className="w-full flex flex-col gap-4 p-4 glass-panel select-none">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-g-text uppercase tracking-wide">H1 Nowcast (0-120)</span>
          <span className="text-xs font-mono text-g-accent">{getDisplayValue(selectedLead)}</span>
        </div>
        {selectedFrame && (
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] uppercase text-g-text-dim tracking-wide">Mean Z</span>
            <span className="text-sm font-mono font-bold text-g-text">{selectedFrame.mean_dbz.toFixed(1)}</span>
            <span className="text-[10px] text-g-text-dim">dBZ</span>
          </div>
        )}
      </div>

      <div className="relative pt-6 pb-6 w-full">
        {/* Custom Track Background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 flex rounded overflow-hidden">
          {/* Past Region */}
          <div 
            className="h-full bg-blue-500/20" 
            style={{ width: `${((0 - min) / (max - min)) * 100}%` }}
          />
          {/* Future Region */}
          <div 
            className="h-full bg-white/10" 
            style={{ width: `${((max - 0) / (max - min)) * 100}%` }}
          />
        </div>

        {/* NOW Marker */}
        <div 
          className="absolute top-1/2 w-0.5 h-6 bg-white -translate-y-1/2 z-0"
          style={{ left: `${((0 - min) / (max - min)) * 100}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* Tick Marks & Labels */}
        <div className="absolute top-1/2 left-0 right-0 h-full pointer-events-none z-0">
          {[-60, -30, 0, 30, 60, 90, 120].map((tick) => {
            const percent = ((tick - min) / (max - min)) * 100;
            return (
              <div 
                key={tick} 
                className="absolute flex flex-col items-center"
                style={{ left: `${percent}%`, transform: 'translateX(-50%)', top: '8px' }}
              >
                <div className="w-px h-1.5 bg-white/30 mb-1" />
                <span className={`text-[10px] font-mono ${tick === 0 ? 'text-white font-bold' : 'text-g-text-dim'}`}>
                  {getLabel(tick)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={selectedLead}
          onChange={(e) => onLeadChange(parseInt(e.target.value, 10))}
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent cursor-pointer z-10 m-0"
          style={{
             accentColor: '#38bdf8' // g-accent equivalent color (light blue) for standard browsers
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #38bdf8;
            cursor: pointer;
            border: 2px solid #0a0b0f;
            box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
          }
          input[type=range]::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #38bdf8;
            cursor: pointer;
            border: 2px solid #0a0b0f;
            box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
          }
        `}} />
      </div>
    </div>
  );
}
