import React from 'react';

export default function SystemStatus() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">System Status</h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Model Server</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            Awaiting
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Database</span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            Awaiting
          </span>
        </div>
      </div>
    </div>
  );
}
