import React from 'react';
import EvidencePanel from '@/components/risk/EvidencePanel';

export default function RiskZonePage({ params }: { params: { zoneId: string } }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Risk Zone Intelligence: {params.zoneId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
            <span>Awaiting data connection</span>
          </div>
          <p className="text-sm text-slate-400 italic">
            Explainability: Awaiting data connection for model factors...
          </p>
        </div>
        <EvidencePanel />
      </div>
    </div>
  );
}
