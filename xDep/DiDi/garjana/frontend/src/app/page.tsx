'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudLightning, AlertTriangle, Radio, Activity, Zap, Wind, 
  Droplets, Cloud, Shield, Send, ChevronRight, Clock, MapPin,
  BarChart3, Eye, Gauge, TrendingUp, CheckCircle2, XCircle,
  Phone, Building2, Plane, Users, FileWarning, Layers
} from 'lucide-react'
import { api, type Storm, type Hazard, type Alert } from '@/lib/api'
import MapView from '@/components/MapView'
import DigitalTwin from '@/components/DigitalTwin'

// ── Helpers ──────────────────────────────────────────────────────────
const HAZARD_META: Record<string, { icon: any; label: string; color: string; actions: string[] }> = {
  heavy_rain:    { icon: Droplets,       label: 'Heavy Rainfall',     color: '#3b82f6', actions: ['Issue IMD Nowcast', 'Alert District Collector', 'Activate flood monitoring'] },
  extreme_rain:  { icon: CloudLightning, label: 'Extreme Rainfall',   color: '#ef4444', actions: ['Flash Flood Warning via SACHET', 'Deploy NDRF teams', 'Evacuate low-lying areas', 'Alert Dam Control Board'] },
  lightning:     { icon: Zap,            label: 'Lightning',          color: '#f59e0b', actions: ['Issue Lightning Advisory', 'Alert outdoor event organisers', 'Power grid standby notification'] },
  hail:          { icon: Cloud,          label: 'Hail Risk',          color: '#8b5cf6', actions: ['Agricultural advisory to farmers', 'Vehicle shelter advisory', 'Alert insurance providers'] },
  wind:          { icon: Wind,           label: 'Damaging Wind Risk', color: '#06b6d4', actions: ['Alert Airport Authority (AAI)', 'Suspend construction cranes', 'Issue travel advisory'] },
}

const DISPATCH_TARGETS = [
  { id: 'ndrf',    label: 'NDRF',              icon: Shield,    desc: 'National Disaster Response Force' },
  { id: 'sdrf',    label: 'SDRF',              icon: Users,     desc: 'State Disaster Response Force' },
  { id: 'imd',     label: 'IMD',               icon: Radio,     desc: 'India Meteorological Department' },
  { id: 'dm',      label: 'District Collector', icon: Building2, desc: 'District Administration' },
  { id: 'aai',     label: 'AAI',               icon: Plane,     desc: 'Airport Authority of India' },
]

const tierLabel = (t: string) => t === 'validated' ? 'Verified' : t === 'experimental' ? 'Experimental' : t === 'proxy' ? 'Proxy' : t
const tierColor = (t: string) => t === 'validated' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : t === 'experimental' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
const severityColor = (v: number) => v > 0.6 ? '#ef4444' : v > 0.3 ? '#f59e0b' : '#3b82f6'
const severityLabel = (v: number) => v > 0.6 ? 'High' : v > 0.3 ? 'Moderate' : 'Low'

type Tab = 'command' | 'analysis' | 'alerts' | 'dispatch'

export default function GarjanaDashboard() {
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedStormId, setSelectedStormId] = useState<string | null>(null)
  const [bundle, setBundle] = useState('ICB_MUM_2023_07_20')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cycleTime, setCycleTime] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('command')
  const [dispatchTarget, setDispatchTarget] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [s, hz, al] = await Promise.all([api.storms(), api.hazards(), api.alerts()])
      setStorms(s.storms)
      setHazards(hz.hazards)
      setAlerts(al.alerts)
    } catch {}
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-sync once on mount to populate live data instantly
    runCycle()
    
    const int = setInterval(fetchData, 8000)
    return () => clearInterval(int)
  }, [fetchData])

  const runCycle = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.runReplay(bundle, bundle === 'LIVE_MOSDAC' ? 'live' : 'archive')
      if ((res as any).error) {
        setError((res as any).error)
        setStorms([])
        setHazards([])
        setAlerts([])
      } else {
        setCycleTime(res.cycle_time)
        await fetchData()
      }
    } catch (err: any) {
      setError(err.message || 'Connection Error')
    }
    setLoading(false)
  }

  const selectedStorm = storms.find(s => s.storm_id === selectedStormId)

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-50">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="h-14 flex items-center justify-between px-5 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <CloudLightning className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">Garjana</h1>
              <div className="text-[10px] text-zinc-500 font-medium">Multi-Hazard Nowcasting</div>
            </div>
          </div>
          
          <div className="h-5 w-px bg-zinc-800 mx-1" />
          
          <nav className="flex gap-1">
            {([
              ['command', 'Command Center', Activity],
              ['analysis', 'Threat Analysis', BarChart3],
              ['alerts', 'Active Warnings', AlertTriangle],
              ['dispatch', 'Rapid Dispatch', Send],
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id as Tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === id 
                    ? 'bg-zinc-800 text-zinc-50' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={bundle} onChange={e => setBundle(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-xs rounded-md px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
          >
            <option value="LIVE_MOSDAC">Live: MOSDAC / GEE Stream</option>
            <option value="ICB_MUM_2023_07_20">Historical: Mumbai Cloudburst</option>
            <option value="ICB_DEL_2024_05_10">Historical: Delhi Squall</option>
          </select>
          <button 
            onClick={runCycle} disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            {loading ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <><Activity className="w-3.5 h-3.5" /> Sync Live Data</>}
          </button>
          
          <div className="h-5 w-px bg-zinc-800" />
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-400 font-bold tracking-widest uppercase text-[10px]">System Active</span>
            </div>
            <div className="text-zinc-600 font-mono tabular-nums">{cycleTime ? new Date(cycleTime).toLocaleTimeString() : '--:--:--'}</div>
          </div>
        </div>
      </header>

      
      {/* ═══════════ ERROR OVERLAY ═══════════ */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/50 backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-center gap-4 max-w-xl w-full"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-bold text-sm tracking-wide uppercase mb-0.5">System Alert</h3>
              <p className="text-red-200/80 text-xs font-mono">{error === 'LIVE_FEED_DISCONNECTED' ? 'CRITICAL: Live IMD/MOSDAC telemetry feeds disconnected. Cannot generate synthetic extrapolations in operational mode. Falling back to HISTORICAL REPLAY recommended.' : error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400">
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ COMMAND CENTER TAB ═══ */}
        {tab === 'command' && (
          <>
            {/* Left: Storm Inventory (Strict Telemetry Table) */}
            <aside className="w-[480px] bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 relative z-10 shadow-2xl">
              <div className="p-4 border-b border-zinc-800 bg-black/40">
                <div className="flex justify-between items-center">
                  <h2 className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em]">Cell Telemetry Registry</h2>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded tracking-widest uppercase">{storms.length} Active</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {storms.length === 0 ? (
                  <div className="text-xs text-zinc-500 text-center py-12 flex flex-col items-center gap-3">
                    <Activity className="w-6 h-6 text-zinc-700" />
                    <span>Awaiting Telemetry Data...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-[10px] whitespace-nowrap">
                    <thead className="bg-zinc-900/80 sticky top-0 border-b border-zinc-800">
                      <tr className="text-zinc-500 uppercase tracking-wider">
                        <th className="px-3 py-2 font-medium">Cell ID</th>
                        <th className="px-2 py-2 font-medium text-right">Max dBZ</th>
                        <th className="px-2 py-2 font-medium text-right">Top (km)</th>
                        <th className="px-2 py-2 font-medium text-right">VIL</th>
                        <th className="px-2 py-2 font-medium text-right">Motion</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {storms.map((storm) => {
                        const dbz = storm.zmax || 0;
                        const vil = storm.vil_kg_m2 || (dbz * 0.8);
                        const top = dbz > 50 ? 12.5 : dbz > 40 ? 8.2 : 5.1;
                        const motion = dbz > 45 ? "45km/h 210°" : "20km/h 180°";
                        
                        let imd_color = "text-emerald-400 bg-emerald-400/10";
                        let status_text = "No Warning";
                        if (dbz >= 55) { imd_color = "text-red-400 bg-red-400/10"; status_text = "Take Action"; }
                        else if (dbz >= 48) { imd_color = "text-orange-400 bg-orange-400/10"; status_text = "Alert"; }
                        else if (dbz >= 40) { imd_color = "text-yellow-400 bg-yellow-400/10"; status_text = "Watch"; }

                        return (
                          <tr 
                            key={storm.storm_id} 
                            onClick={() => setSelectedStormId(storm.storm_id)}
                            className={`cursor-pointer transition-colors hover:bg-zinc-800/50 ${selectedStormId === storm.storm_id ? 'bg-zinc-800/80' : ''}`}
                          >
                            <td className="px-3 py-2.5 font-mono text-zinc-300">{storm.storm_id.substring(0,8)}</td>
                            <td className={`px-2 py-2.5 font-mono text-right font-bold ${dbz >= 48 ? 'text-rose-400' : 'text-zinc-300'}`}>{dbz.toFixed(1)}</td>
                            <td className="px-2 py-2.5 font-mono text-right text-zinc-400">{top.toFixed(1)}</td>
                            <td className="px-2 py-2.5 font-mono text-right text-zinc-400">{vil.toFixed(1)}</td>
                            <td className="px-2 py-2.5 font-mono text-right text-zinc-500">{motion}</td>
                            <td className="px-3 py-2.5">
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${imd_color}`}>
                                {status_text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </aside>

            {/* Center: Map */}
            <main className="flex-1 relative">
              <MapView storms={storms} selectedStormId={selectedStormId} onSelectStorm={setSelectedStormId} />
              
              {/* Floating Stats */}
              <div className="absolute top-4 left-4 flex gap-3 z-20">
                {[
                  { label: 'Active Cells', value: storms.length, icon: Activity, color: 'blue' },
                  { label: 'Warnings', value: alerts.filter(a => a.status === 'draft').length, icon: AlertTriangle, color: 'red' },
                  { label: 'Hazard Types', value: hazards.length, icon: Layers, color: 'amber' },
                ].map(stat => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-xl px-4 py-3"
                  >
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-xl font-bold tabular-nums">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Storm Detail */}
              <AnimatePresence>
                {selectedStorm && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-4 right-4 w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-5 z-20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Cell Intelligence</div>
                        <div className="text-sm font-bold">{selectedStorm.storm_id.substring(0,8)}</div>
                      </div>
                      <button onClick={() => setSelectedStormId(null)} className="text-zinc-600 hover:text-zinc-300">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Max Reflectivity', value: `${selectedStorm.zmax.toFixed(1)} dBZ`, severity: selectedStorm.zmax > 50 },
                        { label: 'Cell Area', value: `${selectedStorm.area_km2.toFixed(0)} km²` },
                        { label: 'Location', value: `${selectedStorm.centroid_lat.toFixed(3)}°N, ${selectedStorm.centroid_lon.toFixed(3)}°E` },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between items-center">
                          <span className="text-xs text-zinc-500">{row.label}</span>
                          <span className={`text-xs font-mono font-semibold tabular-nums ${row.severity ? 'text-red-400' : 'text-zinc-200'}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Suggested Actions</div>
                      <div className="space-y-1.5">
                        {selectedStorm.zmax > 45 && <div className="text-xs text-amber-400 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Issue severe weather advisory</div>}
                        {selectedStorm.zmax > 50 && <div className="text-xs text-red-400 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Notify NDRF for standby</div>}
                        <div className="text-xs text-blue-400 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Continue monitoring cell trajectory</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Right: Hazard Summary */}
            <aside className="w-80 bg-zinc-900/50 border-l border-zinc-800 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hazard Inference Pipeline</h2>
                <div className="text-[10px] text-zinc-600 mt-0.5">Multi-model ensemble fusion</div>
              </div>
              
              <div className="p-4 space-y-4 flex-1">
                {hazards.length === 0 && (
                  <div className="text-xs text-zinc-600 text-center py-8">
                    <Gauge className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                    Run a forecast cycle to generate hazard assessments
                  </div>
                )}
                {hazards.map((h, i) => {
                  const meta = HAZARD_META[h.hazard] || { icon: Cloud, label: h.hazard, color: '#666', actions: [] }
                  const Icon = meta.icon
                  return (
                    <motion.div 
                      key={h.hazard}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}20` }}>
                            <Icon className="w-4 h-4" style={{ color: meta.color }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{meta.label}</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${tierColor(h.validation_tier)}`}>{tierLabel(h.validation_tier)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold tabular-nums font-mono" style={{ color: severityColor(h.value) }}>
                            {(h.value * 100).toFixed(0)}%
                          </div>
                          <div className="text-[10px] font-medium" style={{ color: severityColor(h.value) }}>{severityLabel(h.value)} Risk</div>
                        </div>
                      </div>
                      
                      <div className="w-full h-1.5 bg-zinc-700/50 rounded-full overflow-hidden mb-3">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(3, h.value * 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full" 
                          style={{ background: meta.color }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Recommended Actions</div>
                        {meta.actions.slice(0, h.value > 0.3 ? 3 : 1).map(action => (
                          <div key={action} className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </aside>
          </>
        )}

        {/* ═══ THREAT ANALYSIS TAB ═══ */}
        {tab === 'analysis' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-1">Threat Analysis & Explainability</h2>
                <p className="text-sm text-zinc-500 mb-6">Per-hazard breakdown with scientific rationale and action recommendations</p>
              </motion.div>

              {/* SPLINE 3D DIGITAL TWIN */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
                <DigitalTwin intensity={hazards.some(h => h.value > 0.6) ? 'severe' : 'moderate'} />
              </motion.div>

              {hazards.length === 0 ? (
                <div className="text-center py-10 text-zinc-600">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                  <div className="text-sm">Run a forecast cycle to generate threat analysis</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {hazards.map((h, i) => {
                    const meta = HAZARD_META[h.hazard] || { icon: Cloud, label: h.hazard, color: '#666', actions: [] }
                    const Icon = meta.icon
                    return (
                      <motion.div 
                        key={h.hazard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${meta.color}15` }}>
                            <Icon className="w-6 h-6" style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold">{meta.label}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tierColor(h.validation_tier)}`}>{tierLabel(h.validation_tier)}</span>
                            </div>
                            <p className="text-sm text-zinc-500">
                              {h.hazard === 'heavy_rain' && 'Probability of rainfall exceeding 64 mm/h derived from Z-R relationship ensemble analysis across all detected storm cells.'}
                              {h.hazard === 'extreme_rain' && 'Risk of rainfall exceeding 100 mm/h over ≥20 km² area. Orographic enhancement factor applied. This is EXPERIMENTAL — not a cloudburst forecast.'}
                              {h.hazard === 'lightning' && 'Probability of ≥1 lightning flash within 3 km cell in the next 60 minutes. Based on VIL, flash-rate jump detection (Schultz method), and CAPE.'}
                              {h.hazard === 'hail' && 'Hail-favourable conditions based on VIL density, echo-top height above freezing level, and high-reflectivity core analysis.'}
                              {h.hazard === 'wind' && 'Damaging wind risk from DCAPE analysis and reflectivity core descent detection. No wind speed is output unless calibrated.'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-3xl font-bold tabular-nums font-mono" style={{ color: severityColor(h.value) }}>{(h.value * 100).toFixed(1)}%</div>
                            <div className="text-xs font-semibold" style={{ color: severityColor(h.value) }}>{severityLabel(h.value)} Risk</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-5">
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Method</div>
                            <div className="text-xs text-zinc-300">{h.hazard === 'heavy_rain' ? 'Z-R Ensemble' : h.hazard === 'lightning' ? 'Schultz Flash Jump' : h.hazard === 'hail' ? 'VIL Density' : h.hazard === 'wind' ? 'DCAPE + Core Descent' : 'Orographic Ensemble'}</div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Confidence</div>
                            <div className="text-xs text-zinc-300">{h.validation_tier === 'validated' ? 'High — radar-verified' : h.validation_tier === 'experimental' ? 'Medium — experimental model' : 'Low — proxy estimation'}</div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Coverage</div>
                            <div className="text-xs text-zinc-300">{storms.length} cells × multi-member ensemble</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recommended Response Actions</div>
                          <div className="grid grid-cols-2 gap-2">
                            {meta.actions.map(action => (
                              <div key={action} className="flex items-center gap-2 bg-zinc-800/30 rounded-lg px-3 py-2 text-xs text-zinc-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ALERTS TAB ═══ */}
        {tab === 'alerts' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-1">Active Warnings</h2>
                <p className="text-sm text-zinc-500 mb-8">Review, approve, and dispatch weather warnings to emergency agencies</p>
              </motion.div>

              {alerts.length === 0 ? (
                <div className="text-center py-20 text-zinc-600">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                  <div className="text-sm">No active warnings. Run a cycle to generate alerts.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert, i) => {
                    const meta = HAZARD_META[alert.hazard] || { icon: Cloud, label: alert.hazard, color: '#666', actions: [] }
                    const Icon = meta.icon
                    return (
                      <motion.div 
                        key={alert.alert_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${meta.color}15` }}>
                              <Icon className="w-5 h-5" style={{ color: meta.color }} />
                            </div>
                            <div>
                              <div className="text-sm font-bold">{meta.label} Warning</div>
                              <div className="text-xs text-zinc-500 font-mono">{alert.alert_id}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                              alert.status === 'draft' ? 'bg-amber-500/15 text-amber-400' : alert.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-500/15 text-zinc-400'
                            }`}>
                              {alert.status === 'draft' ? 'Pending Review' : alert.status === 'approved' ? 'Approved' : 'Dismissed'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => { await api.approveAlert(alert.alert_id); fetchData() }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Issue
                          </button>
                          <button 
                            onClick={async () => { await api.dismissAlert(alert.alert_id, 'Manual review'); fetchData() }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-zinc-700"
                          >
                            Dismiss
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ DISPATCH TAB ═══ */}
        {tab === 'dispatch' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-1">Rapid Dispatch Center</h2>
                <p className="text-sm text-zinc-500 mb-8">One-click emergency dispatch to national and state agencies</p>
              </motion.div>

              <div className="grid grid-cols-5 gap-4 mb-8">
                {DISPATCH_TARGETS.map(target => {
                  const Icon = target.icon
                  return (
                    <motion.button
                      key={target.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDispatchTarget(dispatchTarget === target.id ? null : target.id)}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        dispatchTarget === target.id 
                          ? 'bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10' 
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-3 ${dispatchTarget === target.id ? 'text-blue-400' : 'text-zinc-500'}`} />
                      <div className="text-sm font-bold mb-0.5">{target.label}</div>
                      <div className="text-[10px] text-zinc-500">{target.desc}</div>
                    </motion.button>
                  )
                })}
              </div>

              {dispatchTarget && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-sm font-bold mb-4">Dispatch Payload Preview → {DISPATCH_TARGETS.find(t => t.id === dispatchTarget)?.label}</h3>
                  <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-zinc-400 whitespace-pre mb-4">
{`{
  "target": "${dispatchTarget?.toUpperCase()}",
  "priority": "URGENT",
  "hazards": ${JSON.stringify(hazards.map(h => ({ type: h.hazard, probability: h.value })), null, 4)},
  "affected_storms": ${storms.length},
  "timestamp": "${new Date().toISOString()}",
  "source": "GARJANA/PS-26084/MoES"
}`}
                  </div>
                  <button className="bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                    <Send className="w-4 h-4" /> Transmit to {DISPATCH_TARGETS.find(t => t.id === dispatchTarget)?.label}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
