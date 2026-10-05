'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

interface MLStatus {
  model_id: string;
  model_name: string;
  model_version: string;
  model_status: string;
  model_type: string;
  training_dataset: string;
  geographic_scope: string;
  ner_generalization: string;
  spatial_validation: string;
  ood_status: string;
  calibration_status: string;
  operational_use: string;
  model_artifact_available: boolean;
  validation_metrics: Record<string, number> | string;
  feature_importance: Record<string, number> | string;
  known_limitations: string[];
  disclaimer: string;
}

interface MaturityItem {
  score: string;
  detail: string;
}

interface MLMaturity {
  data_provenance: MaturityItem;
  label_quality: MaturityItem;
  feature_pipeline: MaturityItem;
  model_training: MaturityItem;
  spatial_validation: MaturityItem;
  calibration: MaturityItem;
  ood_detection: MaturityItem;
  explainability: MaturityItem;
  registry_versioning: MaturityItem;
  operational_integration: MaturityItem;
  overall: string;
  disclaimer: string;
}

function StatusBadge({ status }: { status: string }) {
  const displayMap: Record<string, string> = {
    'DEVELOPMENT_BENCHMARK': 'Training in Progress',
    'PRODUCTION': 'Production Ready',
    'BLOCKED': 'Needs Review',
    'EXPERIMENTAL': 'Experimental',
    'NOT VALIDATED': 'Pending Validation',
    'STRICT_CHECK': 'Strict Evaluation',
    'GRID_BLOCK_HOLDOUT': 'Spatial Holdout',
    'PLATT SCALING': 'Calibrated',
    'SECONDARY EVIDENCE ONLY': 'Secondary Evidence',
    'UNAVAILABLE': 'Not Available',
  };
  const displayName = displayMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  const colorMap: Record<string, string> = {
    'DEVELOPMENT_BENCHMARK': 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]',
    'PRODUCTION': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
    'BLOCKED': 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    'EXPERIMENTAL': 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    'NOT VALIDATED': 'text-slate-400 bg-white/5 border-white/10',
    'STRICT_CHECK': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]',
    'GRID_BLOCK_HOLDOUT': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
    'PLATT SCALING': 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]',
    'SECONDARY EVIDENCE ONLY': 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]',
    'UNAVAILABLE': 'text-slate-400 bg-white/5 border-white/10',
  };
  const color = colorMap[status] || 'text-slate-400 bg-white/5 border-white/10';
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${color} whitespace-nowrap`}>
      {displayName}
    </span>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const color = pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : pct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
  const displayLabel = label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="w-32 text-white/60 font-medium truncate">{displayLabel}</div>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-12 text-right text-white/90 font-mono text-xs">{value.toFixed(3)}</div>
    </div>
  );
}

function FeatureBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const level = pct > 60 ? 'High' : pct > 30 ? 'Medium' : 'Low';
  const color = level === 'High' ? 'bg-gradient-to-r from-indigo-500 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : level === 'Medium' ? 'bg-gradient-to-r from-indigo-500/60 to-indigo-400/60' : 'bg-white/20';
  const displayLabel = label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="w-32 text-white/60 font-medium truncate">{displayLabel}</div>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`w-14 text-right text-xs font-medium ${
        level === 'High' ? 'text-indigo-400' : level === 'Medium' ? 'text-indigo-400/80' : 'text-white/40'
      }`}>{level}</div>
    </div>
  );
}

export default function MLAssessmentPanel() {
  const [status, setStatus] = useState<MLStatus | null>(null);
  const [maturity, setMaturity] = useState<MLMaturity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, m] = await Promise.all([
          fetchApi<MLStatus>('/ml/status'),
          fetchApi<MLMaturity>('/ml/maturity'),
        ]);
        setStatus(s);
        setMaturity(m);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-white/40 text-sm font-medium animate-pulse text-center mt-10">Loading model information...</div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-rose-400 text-sm font-mono">Error: {error || 'Unknown subsystem failure'}</div>
    );
  }

  const metrics = typeof status.validation_metrics === 'object' ? status.validation_metrics : null;
  const importance = typeof status.feature_importance === 'object' ? status.feature_importance : null;
  const maxImportance = importance ? Math.max(...Object.values(importance)) : 1;

  const DetailRow = ({ label, value, isBadge = false }: { label: string, value: string, isBadge?: boolean }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/60 font-medium">{label}</span>
      {isBadge ? <StatusBadge status={value} /> : <span className="text-sm font-medium text-white/90">{value}</span>}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pr-2">
      {/* Model Parameters */}
      <div className="flex flex-col bg-white/5 p-4 rounded-xl border border-white/5 shadow-sm">
        <DetailRow label="Active Model" value={status.model_name} />
        <DetailRow label="Architecture" value={status.model_type} />
        <DetailRow label="Training Dataset" value={status.training_dataset} />
        <DetailRow label="Geographic Scope" value={status.geographic_scope} isBadge />
        <DetailRow label="Anomaly Detection" value={status.ood_status} isBadge />
        <DetailRow label="Spatial Validation" value={status.spatial_validation} isBadge />
        <DetailRow label="Calibration Status" value={status.calibration_status} isBadge />
        <DetailRow label="Operational Role" value={status.operational_use} isBadge />
      </div>

      {/* Validation Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="bg-black/20 border border-white/5 p-5 rounded-xl">
          <div className="text-sm font-medium text-white/80 mb-5 flex justify-between items-center">
            <span>Evaluation Metrics</span>
            <span className="text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 text-xs">Spatial Holdout</span>
          </div>
          <div className="space-y-4">
            {Object.entries(metrics).map(([key, val]) => (
              <MetricBar key={key} label={key} value={val} />
            ))}
          </div>
        </div>
      )}

      {/* Feature Importance */}
      {importance && Object.keys(importance).length > 0 && (
        <div className="bg-black/20 border border-white/5 p-5 rounded-xl">
          <div className="text-sm font-medium text-white/80 mb-5 flex justify-between items-center">
            <span>Feature Weights</span>
            <span className="text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 text-xs">Gini Impurity</span>
          </div>
          <div className="space-y-4">
            {Object.entries(importance)
              .sort(([,a], [,b]) => b - a)
              .map(([key, val]) => (
                <FeatureBar key={key} label={key} value={val} max={maxImportance} />
              ))}
          </div>
        </div>
      )}

      {/* Maturity Scorecard */}
      {maturity && (
        <div>
          <div className="text-sm font-medium text-white/80 mb-4 flex justify-between items-center pb-2">
            <span>Data Provenance Framework</span>
            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">{maturity.overall.charAt(0).toUpperCase() + maturity.overall.slice(1).toLowerCase()}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {Object.entries(maturity)
              .filter(([k]) => !['overall', 'disclaimer'].includes(k))
              .map(([key, item]) => {
                const m = item as MaturityItem;
                const displayKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const displayScore = m.score.charAt(0).toUpperCase() + m.score.slice(1).toLowerCase();
                return (
                  <div key={key} className="flex flex-col bg-white/5 px-4 py-3 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-white/70">{displayKey}</span>
                      <span className="text-xs font-medium text-emerald-400">{displayScore}</span>
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed">{m.detail}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl">
        <p className="text-xs leading-relaxed text-amber-200/80">
          <strong className="font-medium text-amber-400 mr-2">Note:</strong> 
          {status.disclaimer}
        </p>
      </div>
    </div>
  );
}
