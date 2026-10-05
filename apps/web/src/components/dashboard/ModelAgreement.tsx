import React from 'react';

export default function ModelAgreement() {
  return (
    <div className="w-full flex items-center justify-between text-[11px] tracking-widest uppercase font-medium">
      <div className="text-white/60">Ensemble Agreement Engine</div>
      <div className="text-indigo-400 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        Standing By
      </div>
    </div>
  );
}
