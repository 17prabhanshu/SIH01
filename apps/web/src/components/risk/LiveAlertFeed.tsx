"use client";

import React, { useEffect, useState } from 'react';

interface AlertMessage {
  alert_id: string;
  priority: string;
  severity: string;
  reason: string;
  timestamp: string;
}

export default function LiveAlertFeed() {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Attempt to connect to the WebSocket endpoint
    let ws: WebSocket;
    
    const connect = () => {
      ws = new WebSocket("ws://127.0.0.1:8000/ws/alerts");
      
      ws.onopen = () => setConnected(true);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_ALERT') {
            setAlerts((prev) => [data.data, ...prev].slice(0, 5)); // keep last 5
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Try to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          </span>
          Live Alert Stream
        </h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {alerts.length === 0 ? (
          <div className="text-sm text-slate-500 italic h-full flex items-center justify-center">
            Monitoring active. No immediate threats detected.
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div key={`${alert.alert_id}-${idx}`} className={`p-3 rounded border text-sm animate-in fade-in slide-in-from-top-2 ${
              alert.severity === 'P1' ? 'bg-rose-950/50 border-rose-900/50 text-rose-200' :
              alert.severity === 'P2' ? 'bg-amber-950/50 border-amber-900/50 text-amber-200' :
              'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    alert.severity === 'P1' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>{alert.severity}</span>
                  {alert.alert_id}
                </span>
                <span className="text-xs opacity-60">{alert.timestamp}</span>
              </div>
              <p className="opacity-90">{alert.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
