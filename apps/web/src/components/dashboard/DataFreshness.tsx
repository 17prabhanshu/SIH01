'use client';
import React, { useEffect, useState } from 'react';

export default function DataFreshness() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTicks(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  const feeds = [
    { name: 'Sentinel-1 Radar Imagery', latency: '45ms', updated: 'Just now', color: 'text-emerald-400', bg: 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]' },
    { name: 'NASA Elevation Data (30m)', latency: '120ms', updated: '2m ago', color: 'text-emerald-400', bg: 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]' },
    { name: 'IMD Precipitation Data', latency: 'Connection interrupted', updated: '6h ago', color: 'text-rose-400', bg: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-3">
        {feeds.map((feed, i) => (
          <div key={i} className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`relative flex h-2 w-2`}>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${feed.bg}`}></span>
              </span>
              <span className="text-sm font-medium text-white/80 tracking-wide">{feed.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs font-semibold tracking-wide ${feed.color}`}>{feed.latency}</span>
              <span className="text-xs font-medium text-white/50 mt-1 capitalize">{feed.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
