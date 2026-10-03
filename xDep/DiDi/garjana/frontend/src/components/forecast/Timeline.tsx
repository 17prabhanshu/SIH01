'use client'

import React from 'react'

interface TimelineProps {
  selectedLead: number
  onLeadChange: (lead: number) => void
  frames?: Array<{ lead_min: number; mean_dbz: number }>
}

export default function Timeline({ selectedLead, onLeadChange, frames = [] }: TimelineProps) {
  return (
    <div className="w-full flex flex-col gap-4 p-4 glass-panel select-none bg-g-surface">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Forecast Timeline</span>
          <span className="text-xs text-g-dim">
            {selectedLead === 0 ? 'Current Time' : selectedLead > 0 ? `+${selectedLead} Minutes` : `${selectedLead} Minutes`}
          </span>
        </div>
      </div>

      <div className="relative pt-6 pb-6 w-full">
        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 flex rounded-full overflow-hidden bg-g-border">
          <div className="h-full bg-g-accent/30" style={{ width: '33.33%' }} />
          <div className="h-full bg-g-dim/20" style={{ width: '66.67%' }} />
        </div>

        {/* NOW marker */}
        <div 
          className="absolute top-1/2 w-0.5 h-6 bg-white -translate-y-1/2 z-0" 
          style={{ left: '33.33%', transform: 'translate(-50%, -50%)' }} 
        />

        {/* Labels */}
        <div className="absolute top-1/2 left-0 right-0 h-full pointer-events-none z-0">
          {[
            { v: -60, l: '-60m', p: 0 },
            { v: -30, l: '-30m', p: 16.67 },
            { v: 0, l: 'NOW', p: 33.33, w: true },
            { v: 30, l: '+30m', p: 50 },
            { v: 60, l: '+60m', p: 66.67 },
            { v: 90, l: '+90m', p: 83.33 },
            { v: 120, l: '+120m', p: 100 },
          ].map(mark => (
            <div 
              key={mark.v} 
              className="absolute flex flex-col items-center" 
              style={{ left: `${mark.p}%`, transform: 'translateX(-50%)', top: '12px' }}
            >
              <div className="w-px h-1.5 bg-g-dim mb-1" />
              <span className={`text-[11px] ${mark.w ? 'text-white font-bold' : 'text-g-dim'}`}>
                {mark.l}
              </span>
            </div>
          ))}
        </div>

        {/* Range slider */}
        <input
          type="range"
          min="-60"
          max="120"
          step="10"
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent cursor-pointer z-10 m-0"
          style={{ accentColor: '#3b82f6' }}
          value={selectedLead}
          onChange={(e) => onLeadChange(parseInt(e.target.value))}
        />
        
        <style dangerouslySetInnerHTML={{__html: `
          input[type=range]::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            border: 2px solid #3b82f6;
          }
          input[type=range]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ffffff;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            border: 2px solid #3b82f6;
          }
        `}} />
      </div>
    </div>
  )
}
