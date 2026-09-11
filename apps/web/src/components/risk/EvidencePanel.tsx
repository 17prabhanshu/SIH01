import React from 'react';

export default function EvidencePanel({ freshness, coverage }: { freshness?: Record<string, string>, coverage?: number }) {
  if (!freshness) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-slate-800">Evidence Pipelines</h3>
        <span className="text-sm font-medium text-slate-500">Coverage: {coverage ? (coverage * 100).toFixed(0) : 0}%</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(freshness).map(([source, status]) => (
          <div key={source} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
            <span className="text-sm font-mono text-slate-700 capitalize">{source.replace(/_/g, ' ')}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              status === 'LIVE' ? 'bg-emerald-100 text-emerald-700' :
              status === 'HISTORICAL' ? 'bg-blue-100 text-blue-700' :
              status === 'AUTH_REQUIRED' ? 'bg-rose-100 text-rose-700' :
              'bg-slate-200 text-slate-600'
            }`}>
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
