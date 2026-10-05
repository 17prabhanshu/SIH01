import React from 'react';
import NERMap from '@/components/map/NERMap';
import SystemStatus from '@/components/dashboard/SystemStatus';
import AlertFeed from '@/components/dashboard/AlertFeed';
import ModelAgreement from '@/components/dashboard/ModelAgreement';
import DataFreshness from '@/components/dashboard/DataFreshness';
import MLAssessmentPanel from '@/components/dashboard/MLAssessmentPanel';

export default function CommandCentre() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Hero Background Map */}
      <div className="absolute inset-0 z-0">
        <NERMap />
        {/* Subtle vignette over the map */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80" />
      </div>

      {/* Floating Top Navigation */}
      <header className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-between w-full max-w-5xl px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold tracking-wide text-white">
            NER Landslide Intelligence <span className="text-white/30 mx-2">/</span> <span className="text-white/60 font-light">Global Ops</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">System Active</span>
          </div>
        </div>
      </header>

      {/* Floating Left Panel (ML & Status) */}
      <aside className="absolute top-24 left-6 z-10 w-[380px] bottom-6 flex flex-col gap-4">
        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all hover:bg-black/50 hover:border-white/20">
          <div className="p-5 border-b border-white/5">
            <h2 className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em] mb-4">Core Telemetry</h2>
            <SystemStatus />
          </div>
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
            <MLAssessmentPanel />
          </div>
        </div>
      </aside>

      {/* Floating Right Panel (Alerts & Data) */}
      <aside className="absolute top-24 right-6 z-10 w-[420px] bottom-6 flex flex-col gap-4">
        <div className="flex-[2] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all hover:bg-black/50 hover:border-white/20">
          <div className="p-5 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em]">Active Event Stream</h2>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            </div>
          </div>
          <div className="flex-1 p-5 overflow-hidden">
            <AlertFeed />
          </div>
        </div>

        <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col transition-all hover:bg-black/50 hover:border-white/20">
          <h2 className="text-[11px] font-medium text-white/50 uppercase tracking-[0.2em] mb-4">Ingestion Pipelines</h2>
          <div className="flex-1">
            <DataFreshness />
          </div>
        </div>
      </aside>

      {/* Floating Bottom Center Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl px-6 py-3 transition-all hover:bg-black/50">
          <ModelAgreement />
        </div>
      </div>
      
    </div>
  );
}
