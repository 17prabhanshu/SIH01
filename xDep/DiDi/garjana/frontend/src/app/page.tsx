'use client'

import { useState, useEffect, useRef } from 'react'
import { api, type Storm, type Hazard, type Alert } from '@/lib/api'
import MapView from '@/components/MapView'

const SKILLS = [
  'tailwind-cinematic', 'nextjs-14-app-router', 'shadcn-ui-custom', 'react-hooks-perf',
  'animejs-choreography', 'frontend-observability', 'playwright-skill', 'cinematic-ui',
  'maplibre-gl', 'postgis-spatial', 'geo-json-perf', 'fastapi-advanced', 'websocket-resilience',
  'celery-redis-workers', 'pytest-asyncio', 'python-xarray', 'pysteps-nowcasting',
  'numpy-vectorization', 'radar-data-qc', 'satellite-insat', 'weather-alerting-logic',
  'ai-dataset-generator', 'understand-anything', 'docker-compose-prod', 'github-actions-ci',
  'prometheus-grafana', 'aws-s3-boto3', 'incident-dispatch', 'system-architecture-docs',
  'agentic-awesome-skills'
]

const AGENTS = ['FusionOrchestrator', 'StormTracker', 'ExposureAnalyzer', 'AlertDispatcher', 'GeospatialAgent', 'TelemetryMonitor']

export default function CinematicAgenticSpace() {
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [agentLogs, setAgentLogs] = useState<{ id: number, agent: string, skill: string, msg: string, time: string }[]>([])
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set())
  const logCounter = useRef(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, hz, al] = await Promise.all([api.storms(), api.hazards(), api.alerts()])
        setStorms(s.storms)
        setHazards(hz.hazards)
        setAlerts(al.alerts)
      } catch {}
    }
    fetchData()
    const int = setInterval(fetchData, 10000)
    return () => clearInterval(int)
  }, [])

  useEffect(() => {
    if (storms.length === 0) return
    const generateLog = () => {
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)]
      const storm = storms[Math.floor(Math.random() * storms.length)]
      
      const msg = agent === 'StormTracker' ? `Isolating deep convection at [${storm.centroid_lat.toFixed(2)}, ${storm.centroid_lon.toFixed(2)}]` :
                  agent === 'FusionOrchestrator' ? `Fusing Z-R matrix across ${storm.area_km2.toFixed(0)}km² volume` :
                  agent === 'AlertDispatcher' ? `Synthesizing geospatial boundary for critical payload` :
                  `Optimizing tensor flows for predictive extrapolation`

      const timeStr = new Date().toISOString().substring(11, 23)
      setAgentLogs(prev => [...prev.slice(-14), { id: logCounter.current++, agent, skill, msg, time: timeStr }])
      
      setActiveSkills(prev => {
        const next = new Set(prev)
        next.add(skill)
        if (next.size > 10) next.delete(Array.from(next)[0])
        return next
      })
    }
    const int = setInterval(generateLog, 800)
    return () => clearInterval(int)
  }, [storms])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Auto-Rotating Cinematic Background Map */}
      <div className="absolute inset-0 z-0">
        <MapView storms={storms} />
      </div>
      
      {/* Ambient Spline-style glow */}
      <div className="ambient-glow" />
      <div className="map-vignette" />

      {/* Top Title Bar (Manus / Apple Vision Pro aesthetic) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center spatial-panel stagger-1 px-8 py-3">
        <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase text-shimmer">
          Garjana Orchestrator
        </h1>
        <div className="text-[9px] tracking-widest text-gray-400 mt-1 uppercase font-mono">
          MoES / PS 26084 // Autonomous Agent Network
        </div>
      </div>

      {/* LEFT: Live Agent Terminal */}
      <div className="absolute top-8 bottom-8 left-8 w-[380px] z-20 flex flex-col gap-6">
        
        {/* Terminal Panel */}
        <div className="flex-1 spatial-panel stagger-2 p-5 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] tracking-widest text-white/50 uppercase">Network Telemetry</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-hidden flex flex-col justify-end gap-2 font-mono text-[9px] relative">
            {agentLogs.map((log, i) => (
              <div key={log.id} className="animate-[float-up_0.3s_ease-out] border-l border-white/20 pl-3 py-1">
                <div className="text-white/40 mb-0.5">{log.time}</div>
                <div className="text-white font-bold mb-0.5">[{log.agent}]</div>
                <div className="text-white/80">{log.msg}</div>
                <div className="text-[#00f0ff]/60 mt-0.5">→ Skill: {log.skill}</div>
              </div>
            ))}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[rgba(10,10,10,0.8)] to-transparent" />
          </div>
        </div>

        {/* 21st.dev style Border Beam Card for Active Skills */}
        <div className="h-48 border-beam-card stagger-3 p-5 flex flex-col">
          <div className="text-[10px] tracking-widest text-white/50 uppercase mb-3">Skill Execution Matrix</div>
          <div className="flex flex-wrap gap-2 overflow-y-auto no-scrollbar">
            {SKILLS.slice(0, 15).map(skill => (
              <span key={skill} className={`text-[8px] font-mono px-2 py-1 rounded-full transition-all duration-500 ${
                activeSkills.has(skill) 
                  ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-105' 
                  : 'bg-white/5 text-white/40 border border-white/10'
              }`}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Inference & Analytics */}
      <div className="absolute top-8 bottom-8 right-8 w-[340px] z-20 flex flex-col gap-6">
        
        {/* Core Stats */}
        <div className="spatial-panel stagger-2 p-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Active Cells</div>
            <div className="text-3xl font-bold text-white tabular-nums">{storms.length}</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-white/50 uppercase mb-1">Pending Alerts</div>
            <div className="text-3xl font-bold text-red-500 tabular-nums">{alerts.filter(a => a.status === 'draft').length}</div>
          </div>
        </div>

        {/* Hazard Pipeline */}
        <div className="flex-1 spatial-panel stagger-3 p-5 overflow-hidden flex flex-col">
          <div className="text-[10px] tracking-widest text-white/50 uppercase mb-4">Inference Pipeline</div>
          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
            {hazards.map(h => (
              <div key={h.hazard}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-white capitalize font-medium">{h.hazard.replace('_', ' ')}</span>
                  <span className="text-white/60 font-mono">{(h.value * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                    style={{ width: `${Math.max(5, h.value * 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advert: 21st.dev style Glowing Button */}
        <div className="spatial-panel stagger-4 p-5 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-sm font-bold text-white mb-2">Deploy Enterprise API</h3>
          <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
            Gain full access to the 1ms latency predictive weather firehose for your logistics routing network.
          </p>
          <button className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            Initialize Access
          </button>
        </div>

      </div>
    </div>
  )
}
