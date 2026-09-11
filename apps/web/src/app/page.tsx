import React from 'react';
import NERMap from '@/components/map/NERMap';
import SystemStatus from '@/components/dashboard/SystemStatus';
import AlertFeed from '@/components/dashboard/AlertFeed';
import ModelAgreement from '@/components/dashboard/ModelAgreement';
import DataFreshness from '@/components/dashboard/DataFreshness';
import MLAssessmentPanel from '@/components/dashboard/MLAssessmentPanel';

export default function CommandCentre() {
  return (
    <div className="flex h-screen flex-col bg-slate-100 overflow-hidden">
      <header className="flex h-14 items-center justify-between bg-primary px-6 text-primary-foreground">
        <h1 className="text-lg font-semibold tracking-tight">NER Landslide Early Warning Command Centre</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium">LIVE</span>
          </div>
          <span className="text-sm text-slate-300">{new Date().toISOString()}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto">
          <div className="p-4">
            <SystemStatus />
          </div>
          <div className="p-4 border-t">
            <MLAssessmentPanel />
          </div>
        </aside>
        
        <main className="flex-1 relative">
          <NERMap />
        </main>
        
        <aside className="w-96 flex-shrink-0 border-l bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 border-b">
            <AlertFeed />
          </div>
          <div className="h-1/3 p-4">
            <DataFreshness />
          </div>
        </aside>
      </div>
      
      <footer className="h-12 border-t bg-white flex items-center px-6">
        <ModelAgreement />
      </footer>
    </div>
  );
}
