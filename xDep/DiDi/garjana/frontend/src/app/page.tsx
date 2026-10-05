'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, WS, type Storm, type Hazard, type Alert, type HealthData, type ForecastFrame, type DataSource, type OI } from '@/lib/api'
import MapView from '@/components/MapView'

type Tab = 'overview' | 'alerts' | 'replay' | 'analytics'

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [oi, setOi] = useState<OI | null>(null)
  const [sources, setSources] = useState<DataSource[]>([])
  const [frames, setFrames] = useState<ForecastFrame[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedStorm, setSelectedStorm] = useState<string | null>(null)
  const [leadTime, setLeadTime] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [cycleRunning, setCycleRunning] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [h, s, hz, al, o, dh, f] = await Promise.all([
        api.health(), api.storms(), api.hazards(), api.alerts(),
        api.oi(), api.dataHealth(), api.forecastFrames(),
      ])
      setHealth(h)
      setStorms(s.storms)
      setHazards(hz.hazards)
      setAlerts(al.alerts)
      if (o.oi) setOi(o.oi)
      setSources(dh.sources)
      setFrames(f.frames)
    } catch {}
  }, [])

  useEffect(() => { refresh(); const t = setInterval(refresh, 12000); return () => clearInterval(t) }, [refresh])

  // WebSocket
  useEffect(() => {
    let ws: WebSocket, timer: ReturnType<typeof setTimeout>
    const connect = () => {
      try {
        ws = new WebSocket(WS)
        ws.onopen = () => setWsConnected(true)
        ws.onclose = () => { setWsConnected(false); timer = setTimeout(connect, 5000) }
        ws.onerror = () => ws.close()
        ws.onmessage = () => refresh()
      } catch { timer = setTimeout(connect, 5000) }
    }
    connect()
    return () => { clearTimeout(timer); ws?.close() }
  }, [refresh])

  const storm = storms.find(s => s.storm_id === selectedStorm)
  const draftAlerts = alerts.filter(a => a.status === 'draft')

  const runCycle = async () => {
    setCycleRunning(true)
    try { await api.runReplay(); await refresh() } catch {}
    setCycleRunning(false)
  }

  const humanHazard = (h: string) => ({ lightning: 'Lightning', heavy_rain: 'Heavy Rainfall', extreme_rain: 'Extreme Rainfall', hail: 'Hail', wind: 'Strong Wind' }[h] || h)
  const humanTier = (t: string) => ({ validated: 'Verified', experimental: 'Experimental', proxy: 'Estimated' }[t] || t)
  const severityColor = (v: number) => v > 0.6 ? 'text-red-400' : v > 0.3 ? 'text-amber-400' : 'text-gray-400'
  const severityBg = (v: number) => v > 0.6 ? 'bg-red-500/10 border-red-500/20' : v > 0.3 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-gray-500/10 border-gray-500/20'
  const severityLabel = (v: number) => v > 0.6 ? 'High' : v > 0.3 ? 'Moderate' : 'Low'
  const intensityColor = (z: number) => z > 55 ? '#ef4444' : z > 45 ? '#f97316' : z > 35 ? '#f59e0b' : '#06b6d4'

  return (
    <div className="flex flex-col h-screen bg-[#111827]">
      {/* ─── Top Bar ─── */}
      <header className="h-14 border-b border-gray-700/50 flex items-center px-6 shrink-0 bg-[#111827] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-white">Garjana</span>
          <span className="text-xs text-gray-500 hidden sm:inline">Nowcasting Intelligence</span>
        </div>

        <div className="ml-8 flex gap-1">
          {([
            ['overview', 'Overview'],
            ['alerts', `Alerts${draftAlerts.length ? ` (${draftAlerts.length})` : ''}`],
            ['replay', 'Replay'],
            ['analytics', 'Analytics'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                tab === id ? 'bg-gray-700/60 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}>{label}</button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {health && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              health.run_mode === 'LIVE' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              health.run_mode === 'REPLAY' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-gray-500/10 border-gray-500/20 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                health.run_mode === 'LIVE' ? 'bg-green-400 animate-pulse' :
                health.run_mode === 'REPLAY' ? 'bg-amber-400' : 'bg-gray-400'
              }`} />
              {health.run_mode === 'REPLAY' ? 'Replay Mode' : health.run_mode === 'LIVE' ? 'Live' : 'Synthetic'}
            </div>
          )}
          <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`} title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected'} />
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <>
            {/* Map */}
            <div className="flex-1 relative">
              <MapView storms={storms} selectedStormId={selectedStorm} onSelectStorm={setSelectedStorm} />

              {/* Floating stats bar */}
              <div className="absolute top-4 left-4 right-4 z-10 flex gap-3 pointer-events-none">
                <div className="pointer-events-auto flex gap-2">
                  {[
                    { label: 'Active Storms', value: storms.length, color: 'text-orange-400' },
                    { label: 'Pending Alerts', value: draftAlerts.length, color: draftAlerts.length > 0 ? 'text-red-400' : 'text-gray-400' },
                    { label: 'Observability', value: oi ? `${(oi.composite * 100).toFixed(0)}%` : '—', color: 'text-blue-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl px-4 py-2.5 min-w-[120px]">
                      <div className="text-[11px] text-gray-400 font-medium">{s.label}</div>
                      <div className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hazard bar */}
              {hazards.length > 0 && (
                <div className="absolute bottom-20 left-4 z-10 flex flex-col gap-1.5">
                  {hazards.filter(h => h.value > 0).map(h => (
                    <div key={h.hazard} className={`flex items-center gap-3 px-3.5 py-2 rounded-lg border bg-gray-900/90 backdrop-blur-md ${severityBg(h.value)}`}>
                      <span className={`text-sm font-semibold ${severityColor(h.value)}`}>{humanHazard(h.hazard)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBg(h.value)} ${severityColor(h.value)}`}>{severityLabel(h.value)}</span>
                      <span className="text-[10px] text-gray-500">{humanTier(h.validation_tier)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline scrubber */}
              <div className="absolute bottom-4 left-4 right-[340px] z-10">
                <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-xl px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">Forecast Timeline</span>
                    <span className="text-sm font-semibold tabular-nums text-white">
                      {leadTime === 0 ? 'Now' : leadTime > 0 ? `+${leadTime} min ahead` : `${Math.abs(leadTime)} min ago`}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 px-0.5">
                      <span>1h ago</span><span>30m ago</span><span className="text-white font-semibold">Now</span><span>+30m</span><span>+1h</span><span>+2h</span>
                    </div>
                    <input type="range" min={-60} max={120} step={10} value={leadTime} onChange={e => setLeadTime(+e.target.value)}
                      className="w-full h-1.5 rounded-full appearance-none bg-gray-700 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(249,115,22,0.4)] [&::-webkit-slider-thumb]:cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="w-[340px] border-l border-gray-700/50 bg-[#111827] flex flex-col overflow-hidden shrink-0">
              {/* Storm detail */}
              {storm && (
                <div className="border-b border-gray-700/50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Storm Details</h3>
                    <button onClick={() => setSelectedStorm(null)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Peak Intensity', value: `${storm.zmax.toFixed(1)} dBZ`, color: intensityColor(storm.zmax) },
                      { label: 'Coverage Area', value: `${storm.area_km2.toFixed(0)} km²`, color: '#9ca3af' },
                      { label: 'Latitude', value: `${storm.centroid_lat.toFixed(3)}°N`, color: '#9ca3af' },
                      { label: 'Longitude', value: `${storm.centroid_lon.toFixed(3)}°E`, color: '#9ca3af' },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-[11px] text-gray-400 mb-1">{m.label}</div>
                        <div className="text-[15px] font-semibold tabular-nums" style={{ color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Storm list */}
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-sm font-semibold text-white">Active Storms <span className="text-gray-500 font-normal">({storms.length})</span></h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {storms.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-500 text-sm">No storm activity detected</div>
                    <div className="text-gray-600 text-xs mt-1">Run a forecast cycle to detect storms</div>
                  </div>
                ) : (
                  storms.sort((a, b) => b.zmax - a.zmax).map(s => (
                    <button key={s.storm_id} onClick={() => setSelectedStorm(s.storm_id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-800/50 transition-colors flex items-center gap-3 ${
                        selectedStorm === s.storm_id ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : 'hover:bg-gray-800/30'
                      }`}>
                      <div className="w-3 h-3 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: intensityColor(s.zmax), boxShadow: `0 0 8px ${intensityColor(s.zmax)}40` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-200 truncate">{s.zmax > 50 ? 'Severe' : s.zmax > 40 ? 'Strong' : s.zmax > 30 ? 'Moderate' : 'Weak'} Cell</span>
                          <span className="text-sm font-semibold tabular-nums" style={{ color: intensityColor(s.zmax) }}>{s.zmax.toFixed(0)} dBZ</span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{s.area_km2.toFixed(0)} km² · {s.centroid_lat.toFixed(1)}°N, {s.centroid_lon.toFixed(1)}°E</div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Data sources */}
              <div className="border-t border-gray-700/50 p-4">
                <div className="text-[11px] text-gray-400 font-medium mb-2">Data Sources</div>
                <div className="flex gap-2 flex-wrap">
                  {sources.map(src => (
                    <div key={src.source} className="flex items-center gap-1.5 text-[11px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${src.status === 'available' ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className="text-gray-300 capitalize">{src.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* ═══ ALERTS ═══ */}
        {tab === 'alerts' && (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Alert Management</h2>
                <p className="text-gray-400 text-sm mt-1">Review, approve, and dispatch weather warnings to emergency agencies</p>
              </div>

              {/* Emergency contacts */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 mb-6">
                <div className="text-sm font-semibold text-white mb-3">Quick Dispatch</div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { name: 'NDRF', desc: 'National Disaster Response Force', icon: '🛡️' },
                    { name: 'SDRF', desc: 'State Disaster Response Force', icon: '🏛️' },
                    { name: 'IMD', desc: 'India Meteorological Department', icon: '🌤️' },
                    { name: 'District Magistrate', desc: 'Local administration', icon: '📋' },
                    { name: 'Airport Authority', desc: 'AAI Operations', icon: '✈️' },
                  ].map(a => (
                    <button key={a.name} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-600/50 bg-gray-800/60 hover:bg-gray-700/60 hover:border-gray-500 transition-all text-left group">
                      <span className="text-lg">{a.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-200 group-hover:text-white">{a.name}</div>
                        <div className="text-[10px] text-gray-500">{a.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert list */}
              {alerts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">✓</div>
                  <div className="text-lg font-medium text-gray-300">All clear</div>
                  <div className="text-sm text-gray-500 mt-1">No active weather alerts at this time</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(a => (
                    <div key={a.alert_id} className={`border rounded-xl p-5 transition-all ${
                      a.status === 'draft' ? 'border-amber-500/30 bg-amber-500/5' :
                      a.status === 'approved' ? 'border-green-500/30 bg-green-500/5' :
                      'border-gray-700/50 bg-gray-800/30 opacity-60'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-semibold text-white">{humanHazard(a.hazard)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              a.status === 'draft' ? 'bg-amber-500/15 text-amber-400' :
                              a.status === 'approved' ? 'bg-green-500/15 text-green-400' :
                              'bg-gray-500/15 text-gray-400'
                            }`}>{a.status === 'draft' ? 'Pending Review' : a.status === 'approved' ? 'Approved' : 'Dismissed'}</span>
                            <span className="text-[10px] text-gray-500">{humanTier(a.validation_tier)}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Issued {new Date(a.issued).toLocaleString()} · ID: {a.alert_id.slice(0, 8)}
                          </div>
                        </div>
                        {a.status === 'draft' && (
                          <div className="flex gap-2">
                            <button onClick={async () => { await api.approveAlert(a.alert_id); refresh() }}
                              className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors">
                              Approve
                            </button>
                            <button onClick={async () => { await api.dismissAlert(a.alert_id); refresh() }}
                              className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition-colors">
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ REPLAY ═══ */}
        {tab === 'replay' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Replay Engine</h2>
              <p className="text-gray-400 text-sm mt-1">Run forecast cycles from archived weather events</p>
            </div>

            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
              <div className="text-sm font-semibold text-white mb-4">Available Events</div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-200">SEVIR 2018-05-12</div>
                    <div className="text-xs text-gray-500">24 radar frames + 24 satellite frames · archived severe weather event</div>
                  </div>
                </div>
              </div>

              <button onClick={runCycle} disabled={cycleRunning}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  cycleRunning ? 'bg-gray-700 text-gray-400 cursor-wait' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                }`}>
                {cycleRunning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Processing forecast cycle...
                  </span>
                ) : 'Run Forecast Cycle'}
              </button>
            </div>

            {/* Last cycle stats */}
            {storms.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Storms Detected', value: storms.length, color: 'text-orange-400' },
                  { label: 'Hazards Computed', value: hazards.length, color: 'text-amber-400' },
                  { label: 'Alerts Generated', value: alerts.length, color: 'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 text-center">
                    <div className={`text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ANALYTICS ═══ */}
        {tab === 'analytics' && (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">System Analytics</h2>
                <p className="text-gray-400 text-sm mt-1">Data quality, observability, and forecast performance</p>
              </div>

              {/* Observability */}
              {oi && (
                <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-sm font-semibold text-white">Observability Score</div>
                      <div className="text-xs text-gray-400 mt-0.5">How well we can see weather activity right now</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-400 tabular-nums">{(oi.composite * 100).toFixed(0)}%</div>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(oi.components).map(([k, v]) => {
                      const pct = v * 100
                      const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        .replace('Radar Coverage', 'Radar Range')
                        .replace('Radar Freshness', 'Data Freshness')
                        .replace('Sat Geometry', 'Satellite View')
                        .replace('Ltg Coverage', 'Lightning Detection')
                        .replace('Env Resolution', 'Model Resolution')
                      return (
                        <div key={k} className="text-center">
                          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: pct > 70 ? '#22c55e' : pct > 40 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <div className="text-lg font-bold tabular-nums text-white">{pct.toFixed(0)}%</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Data sources */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 mb-6">
                <div className="text-sm font-semibold text-white mb-4">Data Sources</div>
                <div className="space-y-3">
                  {sources.map(src => {
                    const names: Record<string, string> = { radar: 'Doppler Weather Radar', insat: 'INSAT-3DR Satellite', lightning: 'Lightning Detection Network', nwp: 'Numerical Weather Prediction' }
                    return (
                      <div key={src.source} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${src.status === 'available' ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-gray-500'}`} />
                          <div>
                            <div className="text-sm text-gray-200">{names[src.source] || src.source}</div>
                            <div className="text-[10px] text-gray-500 capitalize">{src.fidelity} data</div>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          src.status === 'available' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>{src.status === 'available' ? 'Online' : 'Offline'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Hazard summary */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="text-sm font-semibold text-white mb-4">Current Hazard Assessment</div>
                {hazards.length === 0 ? (
                  <div className="text-sm text-gray-500">No hazard data. Run a forecast cycle first.</div>
                ) : (
                  <div className="space-y-3">
                    {hazards.map(h => (
                      <div key={h.hazard} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${h.value > 0.6 ? 'bg-red-400' : h.value > 0.3 ? 'bg-amber-400' : 'bg-gray-500'}`} />
                          <span className="text-sm text-gray-200">{humanHazard(h.hazard)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${severityColor(h.value)}`}>{severityLabel(h.value)}</span>
                          <span className="text-[10px] text-gray-500 w-20 text-right">{humanTier(h.validation_tier)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
