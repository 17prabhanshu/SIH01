'use client'

import { useState, useEffect } from 'react'
import { api, type Storm, type Hazard, type Alert } from '@/lib/api'
import MapView from '@/components/MapView'

export default function ProfessionalDashboard() {
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [bundle, setBundle] = useState<string>('ICB_MUM_2023_07_20')
  const [loading, setLoading] = useState(false)
  const [selectedStormId, setSelectedStormId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const [s, hz, al] = await Promise.all([api.storms(), api.hazards(), api.alerts()])
      setStorms(s.storms)
      setHazards(hz.hazards)
      setAlerts(al.alerts)
    } catch {}
  }

  useEffect(() => {
    fetchData()
    const int = setInterval(fetchData, 10000)
    return () => clearInterval(int)
  }, [])

  const runReplay = async () => {
    setLoading(true)
    try {
      await api.runReplay(bundle)
      await fetchData()
    } catch {}
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">G</div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Garjana Convective Nowcasting</h1>
            <div className="text-xs text-slate-500 font-medium">Ministry of Earth Sciences • PS-26084</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Dataset:</span>
            <select 
              value={bundle} 
              onChange={e => setBundle(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ICB_MUM_2023_07_20">Mumbai Cloudburst (20 Jul 2023)</option>
              <option value="ICB_DEL_2024_05_10">Delhi Squall (10 May 2024)</option>
            </select>
            <button 
              onClick={runReplay}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Run Cycle'}
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200" />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-slate-600">Radar Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-slate-600">INSAT Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Storm Cells */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Tracked Convective Cells</h2>
            <div className="text-xs text-slate-500 mt-0.5">{storms.length} active anomalies detected</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {storms.slice(0, 50).map(storm => (
              <div 
                key={storm.storm_id} 
                onClick={() => setSelectedStormId(storm.storm_id)}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedStormId === storm.storm_id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-medium text-slate-700">Cell {storm.storm_id.substring(0,6)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    storm.zmax > 50 ? 'bg-red-100 text-red-700' :
                    storm.zmax > 40 ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {storm.zmax.toFixed(1)} dBZ
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Area: {storm.area_km2.toFixed(0)} km²</span>
                  <span>VIL: {storm.vil_kg_m2.toFixed(1)} kg/m²</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL: Map & Timeline */}
        <main className="flex-1 relative bg-slate-100 flex flex-col">
          <div className="flex-1 relative">
            <MapView storms={storms} selectedStormId={selectedStormId} onSelectStorm={setSelectedStormId} />
          </div>
          
          {/* Timeline Scrubber */}
          <div className="h-16 bg-white border-t border-slate-200 flex items-center px-6 gap-6">
            <span className="text-sm font-semibold text-slate-700 w-24">Nowcast</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
              <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-slate-300 rounded-l-full" />
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow border-2 border-white" />
            </div>
            <div className="flex text-xs font-medium text-slate-500 gap-8">
              <span>T-60m</span>
              <span className="text-blue-600 font-bold">Now</span>
              <span>T+120m</span>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Inference & Alerts */}
        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col z-10 shadow-sm overflow-y-auto">
          
          {/* Hazards Section */}
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Hazard Inference Pipeline</h2>
            <div className="space-y-4">
              {hazards.length === 0 && <div className="text-sm text-slate-500">Run a cycle to generate inferences.</div>}
              {hazards.map(h => (
                <div key={h.hazard}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-medium text-slate-700 capitalize">{h.hazard.replace('_', ' ')}</span>
                    <span className="text-xs font-bold text-slate-600">{(h.value * 100).toFixed(0)}% Prob.</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${h.value > 0.6 ? 'bg-red-500' : h.value > 0.3 ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.max(2, h.value * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="p-5 flex-1 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Active Warnings</h2>
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{alerts.length}</span>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 && <div className="text-sm text-slate-500">No active warnings.</div>}
              {alerts.map(alert => (
                <div key={alert.alert_id} className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider bg-red-50 px-2 py-1 rounded">
                      {alert.severity} WARNING
                    </span>
                    <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-1">{alert.hazard_type.toUpperCase()}</p>
                  <p className="text-xs text-slate-600 mb-3">{alert.description}</p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-1.5 rounded transition-colors">
                      Dispatch NDRF
                    </button>
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 rounded transition-colors border border-slate-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </aside>

      </div>
    </div>
  )
}
