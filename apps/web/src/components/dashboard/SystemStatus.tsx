'use client';
import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function SystemStatus() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetchApi<any>('/health')
      .then(setHealth)
      .catch(() => setHealth({ status: 'unhealthy', dependencies: {} }));
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'up' || status === 'healthy') return 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    if (status === 'down' || status === 'unhealthy') return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    return 'bg-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
  };

  const getStatusText = (status: string) => {
    if (status === 'up' || status === 'healthy') return 'text-emerald-400';
    if (status === 'down' || status === 'unhealthy') return 'text-rose-400';
    return 'text-amber-400';
  };
  
  const displayStatus = (status: string) => {
    if (!status) return 'Waiting...';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3">
        {/* API Core */}
        <div className="flex items-center justify-between bg-white/5 px-5 py-4 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <span className="text-white/80 font-medium text-sm">Model Inference API</span>
          <span className={`flex items-center gap-2 text-sm font-medium ${health ? getStatusText(health.status) : 'text-white/40'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${health ? getStatusColor(health.status) : 'bg-white/20'}`}></span>
            {displayStatus(health?.status)}
          </span>
        </div>

        {/* Database */}
        <div className="flex items-center justify-between bg-white/5 px-5 py-4 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <span className="text-white/80 font-medium text-sm">PostGIS Geospatial Engine</span>
          <span className={`flex items-center gap-2 text-sm font-medium ${health?.dependencies?.database ? getStatusText(health.dependencies.database.status) : 'text-white/40'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${health?.dependencies?.database ? getStatusColor(health.dependencies.database.status) : 'bg-white/20'}`}></span>
            {displayStatus(health?.dependencies?.database?.status)}
          </span>
        </div>

        {/* Redis */}
        <div className="flex items-center justify-between bg-white/5 px-5 py-4 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <span className="text-white/80 font-medium text-sm">High-Speed Event Bus</span>
          <span className={`flex items-center gap-2 text-sm font-medium ${health?.dependencies?.redis ? getStatusText(health.dependencies.redis.status) : 'text-white/40'}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${health?.dependencies?.redis ? getStatusColor(health.dependencies.redis.status) : 'bg-white/20'}`}></span>
            {displayStatus(health?.dependencies?.redis?.status)}
          </span>
        </div>
      </div>
    </div>
  );
}
