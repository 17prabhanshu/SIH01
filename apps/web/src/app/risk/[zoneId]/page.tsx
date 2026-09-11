"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import EvidencePanel from '@/components/risk/EvidencePanel';
import LiveAlertFeed from '@/components/risk/LiveAlertFeed';

const DynamicMap = dynamic(() => import('@/components/map/MapComponent'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full min-h-[400px] rounded-xl bg-slate-200 animate-pulse border border-slate-300 shadow-sm flex items-center justify-center text-slate-500 font-mono">Loading Geospatial Data...</div>
});

interface FusionResult {
  hazard_evidence_score: number;
  assessment_status: string;
  evidence_coverage: number;
  model_agreement: number | null;
  assessment_confidence: string;
  explainability_report: string;
  data_freshness: Record<string, string>;
  contributing_factors: Record<string, number>;
}

interface ExposureResult {
  status: string;
  buildings_exposed: number;
  hospitals_exposed: number;
  schools_exposed: number;
  road_segments_exposed: number;
  exposure_criticality: number;
}

export default function RiskZonePage({ params }: { params: { zoneId: string } }) {
  const [fusion, setFusion] = useState<FusionResult | null>(null);
  const [exposure, setExposure] = useState<ExposureResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded Gangtok coordinates for the MVP prototype zone
    const lat = 27.3314;
    const lon = 88.6138;

    const fetchData = async () => {
      try {
        const [fusionRes, exposureRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/v1/risk/evaluate?lat=${lat}&lon=${lon}`),
          fetch(`http://127.0.0.1:8000/api/v1/exposure/location?lat=${lat}&lon=${lon}`)
        ]);

        if (fusionRes.ok) setFusion(await fusionRes.json());
        if (exposureRes.ok) setExposure(await exposureRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-mono text-slate-500 animate-pulse">Initializing NER Intelligence...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Risk Intelligence: {params.zoneId}</h1>
          <p className="text-sm text-slate-500">Lat: 27.3314, Lon: 88.6138</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-bold rounded-full ${
            fusion?.assessment_status === 'LIMITED EVIDENCE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {fusion?.assessment_status || 'UNKNOWN'}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metrics */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Hazard Evidence Score</h3>
            <div className="text-4xl font-black text-slate-800">
              {fusion ? fusion.hazard_evidence_score.toFixed(3) : '-'}
            </div>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">Uncalibrated Heuristic</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 mb-1">Exposure Criticality</h3>
            <div className="text-4xl font-black text-slate-800">
              {exposure ? exposure.exposure_criticality.toFixed(3) : '-'}
            </div>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">OSM Infrastructure Index</p>
          </div>
        </div>

        {/* Explainability and Alerts */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-slate-300 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">AI Explainability</h3>
            <p className="text-sm leading-relaxed font-mono flex-1">
              {fusion?.explainability_report || "Report unavailable."}
            </p>
          </div>
          <LiveAlertFeed />
        </div>

        {/* Evidence Status */}
        <div className="col-span-1 lg:col-span-1">
          <EvidencePanel freshness={fusion?.data_freshness} coverage={fusion?.evidence_coverage} />
        </div>

        {/* Exposure Breakdown */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Infrastructure at Risk</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Hospitals</span>
              <span className="font-mono text-lg text-blue-600 font-bold">{exposure?.hospitals_exposed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Schools</span>
              <span className="font-mono text-lg text-yellow-600 font-bold">{exposure?.schools_exposed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Buildings</span>
              <span className="font-mono text-lg">{exposure?.buildings_exposed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Road Segments</span>
              <span className="font-mono text-lg">{exposure?.road_segments_exposed || 0}</span>
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="col-span-1 lg:col-span-3 h-[500px]">
          <DynamicMap lat={27.3314} lon={88.6138} geojson={(exposure as any)?.geojson} />
        </div>
      </div>
    </div>
  );
}
