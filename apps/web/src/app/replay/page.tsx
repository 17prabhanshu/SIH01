"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, FastForward, RotateCcw, AlertTriangle } from 'lucide-react';
import EvidencePanel from '@/components/risk/EvidencePanel';

const DynamicMap = dynamic(() => import('@/components/map/MapComponent'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full rounded-xl bg-slate-200 animate-pulse border flex items-center justify-center text-slate-500">Loading Geospatial Engine...</div>
});

export default function ReplayDashboard() {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'READY'>('IDLE');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref for playback loop
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReplay = async () => {
    setStatus('LOADING');
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/replay/execute/sikkim-oct-2023", { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setTimeline(data.timeline);
        setStatus('READY');
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error(e);
      setStatus('IDLE');
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // 3 seconds per timestep
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, timeline.length]);

  if (status === 'IDLE') {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center text-slate-200">
        <div className="max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Historical Replay Mode</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Execute a strict causal replay of the October 2023 Sikkim GLOF event. 
            The system will fetch real historical Sentinel-1 SAR and Open-Meteo ERA5 data, 
            processing it through the live fusion engine exactly as it would have on the day.
          </p>
          <button 
            onClick={fetchReplay}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/50"
          >
            Load Historical Data
          </button>
        </div>
      </div>
    );
  }

  if (status === 'LOADING') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-mono">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p>Fetching historical Sentinel-1 acquisitions...</p>
        <p className="text-xs mt-2 opacity-50">This requires live Google Earth Engine processing and may take 30-60 seconds.</p>
      </div>
    );
  }

  const currentStep = timeline[currentIndex];
  const fusion = currentStep?.fusion_result;
  const exposure = currentStep?.exposure_result;
  const alert = currentStep?.alert;
  const timestamp = new Date(currentStep?.timestamp).toLocaleString();

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* Top Navigation / Controls */}
      <div className="bg-slate-900 rounded-xl p-4 mb-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-400" />
            REPLAY: Sikkim October 2023
          </h1>
          <p className="text-sm text-slate-400 font-mono mt-1">Causal Time Context: {timestamp}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setCurrentIndex(0); setIsPlaying(false); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-6 py-2 flex items-center gap-2 font-bold rounded transition-colors ${isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {isPlaying ? <><Pause className="w-5 h-5"/> Pause</> : <><Play className="w-5 h-5"/> Play</>}
          </button>

          <button 
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(Math.min(currentIndex + 1, timeline.length - 1));
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column - Metrics */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Hazard Evidence Score</h2>
            <div className="flex items-end gap-2">
              <span className={`text-5xl font-black ${fusion.hazard_evidence_score > 0.5 ? 'text-rose-600' : 'text-slate-800'}`}>
                {fusion.hazard_evidence_score.toFixed(3)}
              </span>
              <span className="text-lg text-slate-500 mb-1">/ 1.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Uncalibrated causal fusion metric</p>
          </div>

          {alert && (
            <div className={`p-6 rounded-xl shadow-lg animate-in fade-in zoom-in-95 ${alert.priority === 'P1' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold">{alert.priority} ALERT</h2>
              </div>
              <p className="font-medium opacity-90">{alert.reason}</p>
            </div>
          )}

          <EvidencePanel freshness={fusion.data_freshness} coverage={fusion.evidence_coverage} />
        </div>

        {/* Center/Right - Map & Explanations */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 relative">
            {/* We don't have historical GeoJSON strictly extracted for this demo, so we'll just show the map centered */}
            <DynamicMap lat={27.3314} lon={88.6138} />
            
            {/* Overlay Timeline progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800/50">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-linear"
                style={{ width: `${(currentIndex / (timeline.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-slate-300">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">AI Explainability & Provenance</h3>
            <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
              {fusion.explainability_report}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs font-mono opacity-60">
              <div>Rainfall (24h): {fusion.contributing_factors.rainfall_trigger?.toFixed(2) || 'None'}</div>
              <div>SAR Change (dB): {fusion.contributing_factors.sar_amplitude_change?.toFixed(3) || 'No Data'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
