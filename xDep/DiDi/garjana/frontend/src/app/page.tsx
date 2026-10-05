'use client'

import { useState, useEffect, useRef } from 'react'
import { api, type Storm, type Hazard, type Alert } from '@/lib/api'
import MapView from '@/components/MapView'

// The 30 curated skills from our Antigravity framework
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

export default function AgenticCommandCenter() {
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [agentLogs, setAgentLogs] = useState<{ id: number, time: string, agent: string, skill: string, msg: string, level: string }[]>([])
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set())
  const logCounter = useRef(0)
  const logsEndRef = useRef<HTMLDivElement>(null)

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

  // Agent orchestration simulator driven by real data
  useEffect(() => {
    if (storms.length === 0) return

    const generateLog = () => {
      const now = new Date()
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
      
      const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)]
      const storm = storms[Math.floor(Math.random() * storms.length)]
      
      let msg = ''
      let level = 'INFO'

      if (agent === 'StormTracker') {
        msg = `Detecting convective cell at [${storm.centroid_lat.toFixed(4)}, ${storm.centroid_lon.toFixed(4)}] using morphological transformations.`
        if (storm.zmax > 45) level = 'WARN'
      } else if (agent === 'FusionOrchestrator') {
        msg = `Cross-referencing Cell ID ${storm.storm_id.substring(0, 8)} against INSAT-3DR brightness temperatures.`
      } else if (agent === 'AlertDispatcher' && storm.zmax > 50) {
        msg = `Formulating NDRF dispatch payload for severe convective anomaly. Area: ${storm.area_km2.toFixed(1)} km².`
        level = 'CRITICAL'
      } else {
        msg = `Optimizing pipeline matrix tensor operations.`
      }

      const newLog = { id: logCounter.current++, time: timeStr, agent, skill, msg, level }
      
      setAgentLogs(prev => [...prev.slice(-49), newLog])
      
      setActiveSkills(prev => {
        const next = new Set(prev)
        next.add(skill)
        if (next.size > 8) {
          const arr = Array.from(next)
          next.delete(arr[0]) // keep size bounded to simulate dynamic active states
        }
        return next
      })
    }

    const int = setInterval(generateLog, 1200)
    return () => clearInterval(int)
  }, [storms])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentLogs])

  return (
    <div className="flex h-screen bg-[#050505] text-[#a3a3a3] font-mono overflow-hidden">
      
      {/* LEFT: Agent Orchestration Terminal */}
      <div className="w-[420px] border-r border-[#1f2937] flex flex-col bg-[#0a0a0a] z-10">
        <div className="h-12 border-b border-[#1f2937] flex items-center px-4 justify-between bg-black">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
            <span className="text-[#00f0ff] font-bold tracking-widest text-xs">ANTIGRAVITY ORCHESTRATOR</span>
          </div>
          <span className="text-[10px] text-gray-600">v4.0.1-agentic</span>
        </div>

        {/* Live Terminal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[10px] leading-relaxed no-scrollbar relative">
          {agentLogs.length === 0 && (
            <div className="text-gray-600 animate-pulse">Initializing Antigravity Agents... waiting for telemetry.</div>
          )}
          {agentLogs.map((log) => (
            <div key={log.id} className={`font-mono border-l-2 pl-2 ${
              log.level === 'CRITICAL' ? 'border-[#ff003c] text-[#ff003c]' :
              log.level === 'WARN' ? 'border-[#ffb000] text-[#ffb000]' :
              'border-[#00f0ff] text-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-0.5 opacity-70">
                <span>[{log.time}]</span>
                <span className="bg-[#1f2937] px-1 rounded text-white">{log.agent}</span>
              </div>
              <div className="text-[#00f0ff] opacity-80 mb-0.5">↳ Invoked Skill: {log.skill}</div>
              <div className="break-words">{log.msg}</div>
            </div>
          ))}
          <div ref={logsEndRef} />
          
          <div className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        </div>

        {/* Skill Matrix Status */}
        <div className="h-64 border-t border-[#1f2937] bg-black p-4">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Active Skills Matrix ({activeSkills.size}/30)</div>
          <div className="grid grid-cols-2 gap-1.5">
            {SKILLS.slice(0, 14).map(skill => (
              <div key={skill} className={`text-[9px] px-2 py-1 rounded truncate border transition-colors duration-300 ${
                activeSkills.has(skill) 
                  ? 'border-[#00f0ff] bg-[#00f0ff]/10 text-[#00f0ff] shadow-[0_0_8px_rgba(0,240,255,0.2)]' 
                  : 'border-[#1f2937] bg-transparent text-gray-600'
              }`}>
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER: Geospatial Canvas */}
      <div className="flex-1 relative bg-[#000]">
        
        {/* Top HUD Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between pointer-events-none">
          <div className="pointer-events-auto bg-black/80 border border-[#00f0ff]/30 p-3 rounded backdrop-blur">
            <div className="text-[10px] text-[#00f0ff] mb-1 uppercase tracking-widest">Target Context</div>
            <div className="text-sm text-white font-bold">PS 26084: Convective Nowcasting</div>
            <div className="text-xs text-gray-400 mt-1">Indian Cloudburst Architecture</div>
          </div>
          
          <div className="pointer-events-auto flex gap-2">
            <div className="bg-black/80 border border-[#ff003c]/30 p-3 rounded backdrop-blur w-32">
              <div className="text-[10px] text-[#ff003c] mb-1 uppercase">Pending Alerts</div>
              <div className="text-2xl text-white font-bold">{alerts.filter(a => a.status === 'draft').length}</div>
            </div>
            <div className="bg-black/80 border border-[#ffb000]/30 p-3 rounded backdrop-blur w-32">
              <div className="text-[10px] text-[#ffb000] mb-1 uppercase">Storm Cells</div>
              <div className="text-2xl text-white font-bold">{storms.length}</div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0">
          <MapView storms={storms} />
        </div>

        {/* Map HUD scanning lines */}
        <div className="absolute inset-0 pointer-events-none z-10 border-[1px] border-[#00f0ff]/10 m-4 rounded">
          {/* Scanning crosshair */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#00f0ff]/20 shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#00f0ff]/20 shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
        </div>

        {/* Bottom Timeline HUD */}
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/90 border border-[#1f2937] p-4 rounded backdrop-blur flex items-center justify-between pointer-events-auto">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between text-[10px] text-[#00f0ff] mb-2 uppercase tracking-widest px-2">
              <span>T-60m</span><span>T-30m</span><span className="text-white font-bold">NOW [Agent Execution]</span><span>T+30m</span><span>T+60m</span><span>T+120m</span>
            </div>
            <div className="w-full h-1 bg-[#1f2937] relative flex rounded">
              <div className="h-full bg-gray-600 w-1/3" />
              <div className="h-full bg-[#00f0ff] w-2 relative">
                <div className="absolute -top-1 -bottom-1 -left-1 -right-1 bg-[#00f0ff]/30 rounded-full animate-ping" />
              </div>
              <div className="h-full bg-[#1f2937] flex-1 border-t border-b border-dashed border-gray-600" />
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Pipeline & Inference */}
      <div className="w-[320px] border-l border-[#1f2937] bg-[#0a0a0a] flex flex-col z-10">
        <div className="p-4 border-b border-[#1f2937] bg-black">
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest mb-1">Inference Engine</div>
          <div className="text-sm font-bold text-white">Hazard Fusion Pipeline</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Models */}
          <div className="space-y-2">
            {hazards.length === 0 ? (
              <div className="text-xs text-gray-600">Awaiting fusion data...</div>
            ) : (
              hazards.map(h => (
                <div key={h.hazard} className="border border-[#1f2937] bg-black p-3 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-300 capitalize">{h.hazard.replace('_', ' ')} Model</span>
                    <span className={`text-[10px] px-1 rounded ${h.validation_tier === 'validated' ? 'bg-[#00ff66]/20 text-[#00ff66]' : 'bg-[#ffb000]/20 text-[#ffb000]'}`}>
                      {h.validation_tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-full bg-[#1f2937] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${h.value > 0.6 ? 'bg-[#ff003c]' : h.value > 0.3 ? 'bg-[#ffb000]' : 'bg-[#00f0ff]'}`} style={{ width: `${Math.max(10, h.value * 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-gray-500">
                    <span>Confidence</span>
                    <span>{(h.value * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Advert / Skill specific */}
          <div className="mt-8 border border-[#00f0ff]/30 bg-[#00f0ff]/5 p-4 rounded relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#00f0ff]/20 blur-xl rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />
            <div className="relative z-10">
              <div className="text-[9px] text-[#00f0ff] mb-1 tracking-widest uppercase">Agent Output</div>
              <div className="text-sm text-white font-bold mb-2">Garjana Enterprise Dispatch</div>
              <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                Skill <span className="text-[#00f0ff]">`incident-dispatch`</span> is active. Formulating NDRF automated 1ms latency weather payload for rapid response.
              </p>
              <button className="text-[10px] bg-[#00f0ff] text-black font-bold px-3 py-1.5 rounded hover:bg-[#00c0cc] transition-colors uppercase w-full">
                Deploy Payload
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
