'use client';
import React, { useEffect, useState } from 'react';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    const connectWs = () => {
      ws = new WebSocket('ws://localhost:8000/ws/alerts');
      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connectWs, 3000);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NEW_ALERT' || msg.priority) {
            setAlerts(prev => [msg.data || msg, ...prev].slice(0, 50));
          }
        } catch (e) {}
      };
    };
    connectWs();
    return () => ws?.close();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] border border-dashed border-white/10 rounded-xl bg-white/5">
          <div className="text-sm text-white/60 font-medium animate-pulse">
            Waiting for local updates...
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {alerts.map((a, i) => (
            <div key={i} className={`p-4 rounded-xl border backdrop-blur-sm transition-all
                ${a.priority === 'P1' || a.priority === 'P2' || a.severity === 'EXTREME' || a.severity === 'HIGH' 
                  ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                  : 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${a.priority === 'P1' || a.severity === 'EXTREME' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`} />
                  <span className={`font-semibold tracking-wide text-sm capitalize ${a.priority === 'P1' || a.severity === 'EXTREME' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {(a.priority || a.severity || 'Alert').toLowerCase()}
                  </span>
                </div>
                <span className="text-white/50 font-medium text-xs">{a.timestamp || new Date().toLocaleTimeString()}</span>
              </div>
              <div className="text-sm font-medium leading-relaxed text-white/90">{a.reason || 'Unknown anomaly detected.'}</div>
              {a.location && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-indigo-300 font-medium text-xs">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {a.location.lat?.toFixed(4)}, {a.location.lon?.toFixed(4)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
