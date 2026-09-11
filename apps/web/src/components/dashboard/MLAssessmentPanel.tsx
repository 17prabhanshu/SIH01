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
  const colorMap: Record<string, string> = {
    'DEVELOPMENT_BENCHMARK': 'bg-amber-100 text-amber-800 border-amber-300',
    'PRODUCTION': 'bg-green-100 text-green-800 border-green-300',
    'BLOCKED': 'bg-red-100 text-red-800 border-red-300',
    'EXPERIMENTAL': 'bg-purple-100 text-purple-800 border-purple-300',
    'NOT VALIDATED': 'bg-gray-100 text-gray-800 border-gray-300',
    'STRICT_CHECK': 'bg-blue-100 text-blue-800 border-blue-300',
    'GRID_BLOCK_HOLDOUT': 'bg-teal-100 text-teal-800 border-teal-300',
    'PLATT SCALING': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'SECONDARY EVIDENCE ONLY': 'bg-orange-100 text-orange-800 border-orange-300',
    'UNAVAILABLE': 'bg-slate-100 text-slate-500 border-slate-300',
  };
  const color = colorMap[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${color}`}>
      {status}
    </span>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-32 text-slate-600 font-medium capitalize">{label.replace(/_/g, ' ')}</div>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-14 text-right text-slate-700 font-mono">{value.toFixed(3)}</div>
    </div>
  );
}

function FeatureBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const level = pct > 60 ? 'HIGH' : pct > 30 ? 'MEDIUM' : 'LOW';
  const color = level === 'HIGH' ? 'bg-red-500' : level === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-400';
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-28 text-slate-600 font-medium capitalize">{label}</div>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`w-16 text-right text-xs font-semibold ${
        level === 'HIGH' ? 'text-red-600' : level === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-4 bg-slate-100 rounded w-full" />)}
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-700">AI / ML Assessment</h3>
        <p className="text-sm text-red-600 mt-2">Failed to load ML status: {error || 'Unknown error'}</p>
      </div>
    );
  }

  const metrics = typeof status.validation_metrics === 'object' ? status.validation_metrics : null;
  const importance = typeof status.feature_importance === 'object' ? status.feature_importance : null;
  const maxImportance = importance ? Math.max(...Object.values(importance)) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI / ML Assessment
          </h3>
          <StatusBadge status={status.model_status} />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Model Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Development Model</div>
            <div className="font-semibold text-slate-800">{status.model_name}</div>
          </div>
          <div>
            <div className="text-slate-500">Model Type</div>
            <div className="font-semibold text-slate-800">{status.model_type}</div>
          </div>
          <div>
            <div className="text-slate-500">Training Dataset</div>
            <div className="font-semibold text-slate-800">{status.training_dataset}</div>
          </div>
          <div>
            <div className="text-slate-500">Geographic Scope</div>
            <StatusBadge status={status.geographic_scope} />
          </div>
          <div>
            <div className="text-slate-500">NER Generalization</div>
            <StatusBadge status={status.ner_generalization} />
          </div>
          <div>
            <div className="text-slate-500">OOD Status</div>
            <StatusBadge status={status.ood_status} />
          </div>
          <div>
            <div className="text-slate-500">Spatial Validation</div>
            <StatusBadge status={status.spatial_validation} />
          </div>
          <div>
            <div className="text-slate-500">Calibration</div>
            <StatusBadge status={status.calibration_status} />
          </div>
          <div className="col-span-2">
            <div className="text-slate-500">Operational Use</div>
            <StatusBadge status={status.operational_use} />
          </div>
        </div>

        {/* Validation Metrics */}
        {metrics && Object.keys(metrics).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
              Validation Metrics <span className="text-xs text-slate-400 font-normal">(Spatial Holdout)</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics).map(([key, val]) => (
                <MetricBar key={key} label={key} value={val} />
              ))}
            </div>
          </div>
        )}

        {/* Feature Importance */}
        {importance && Object.keys(importance).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
              Model Feature Importance <span className="text-xs text-slate-400 font-normal">(Gini, not causal attribution)</span>
            </h4>
            <div className="space-y-2">
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
            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">
              ML Maturity Scorecard
              <span className="ml-2 text-lg font-bold text-indigo-600">{maturity.overall}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(maturity)
                .filter(([k]) => !['overall', 'disclaimer'].includes(k))
                .map(([key, item]) => {
                  const m = item as MaturityItem;
                  return (
                    <div key={key} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                      <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-indigo-700">{m.score}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">⚠ Disclaimer:</span> {status.disclaimer}
          </p>
        </div>

        {/* Limitations */}
        {status.known_limitations.length > 0 && (
          <div className="text-xs text-slate-500">
            <span className="font-semibold">Known Limitations:</span>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              {status.known_limitations.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
