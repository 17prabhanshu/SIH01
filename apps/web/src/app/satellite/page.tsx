import React from 'react';

export default function SatellitePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Satellite Intelligence</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Sentinel-1 (SAR)</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-2">Sentinel-2 (Optical)</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border relative">
          <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded">EXPERIMENTAL</div>
          <h2 className="text-lg font-semibold mb-2">PolSAR Research Layer</h2>
          <p className="text-sm text-slate-500">Awaiting data connection</p>
        </div>
      </div>
    </div>
  );
}
