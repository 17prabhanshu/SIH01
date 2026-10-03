'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, WS, type Storm, type Hazard, type Alert, type HealthData, type ForecastFrame } from '@/lib/api'
import SystemHeader from '@/components/shell/SystemHeader'
import NavBar from '@/components/shell/NavBar'
import MapView from '@/components/MapView'
import StormList from '@/components/storm/StormList'
import StormDetail from '@/components/storm/StormDetail'
import HazardHUD from '@/components/hazards/HazardHUD'
import Timeline from '@/components/forecast/Timeline'
import AlertDesk from '@/components/alerts/AlertDesk'
import VerificationLab from '@/components/verification/VerificationLab'
import DataHealth from '@/components/data/DataHealth'
import ReplayPanel from '@/components/replay/ReplayPanel'

type Screen = 'control-room' | 'storms' | 'replay' | 'alerts' | 'verification' | 'data-health'

export default function ControlRoom() {
  // ── State ──────────────────────────────────────────────────────
  const [health, setHealth] = useState<HealthData | null>(null)
  const [storms, setStorms] = useState<Storm[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [oi, setOi] = useState<number | null>(null)
  const [frames, setFrames] = useState<ForecastFrame[]>([])
  const [screen, setScreen] = useState<Screen>('control-room')
  const [selectedStorm, setSelectedStorm] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // ── Data fetching ──────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const [h, s, hz, al, o, f] = await Promise.all([
        api.health(),
        api.storms(),
        api.hazards(),
        api.alerts(),
        api.oi(),
        api.forecastFrames(),
      ])
      setHealth(h)
      setStorms(s.storms)
      setHazards(hz.hazards)
      setAlerts(al.alerts)
      if (o.oi) setOi(o.oi.composite)
      setFrames(f.frames)
    } catch (e) {
      console.error('Refresh failed:', e)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  // ── WebSocket ──────────────────────────────────────────────────
  useEffect(() => {
    let ws: WebSocket
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      try {
        ws = new WebSocket(WS)
        wsRef.current = ws

        ws.onopen = () => setWsConnected(true)
        ws.onclose = () => {
          setWsConnected(false)
          reconnectTimer = setTimeout(connect, 5000)
        }
        ws.onerror = () => ws.close()
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data)
            if (msg.type === 'cycle.complete') {
              refresh()
            }
          } catch {}
        }
      } catch {
        reconnectTimer = setTimeout(connect, 5000)
      }
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [refresh])

  // ── Selected storm object ──────────────────────────────────────
  const storm = storms.find(s => s.storm_id === selectedStorm) || null

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-g-bg noise-bg">
      {/* System header */}
      <SystemHeader
        health={health}
        stormCount={storms.length}
        alertCount={alerts.filter(a => a.status === 'draft').length}
        oi={oi}
      />

      {/* Navigation */}
      <NavBar active={screen} onNavigate={(s) => setScreen(s as Screen)} />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── CONTROL ROOM ────────────────────────────────────── */}
        {screen === 'control-room' && (
          <>
            {/* Map (hero) */}
            <div className="flex-1 relative">
              <MapView
                storms={storms}
                selectedStormId={selectedStorm}
                onSelectStorm={setSelectedStorm}
              />

              {/* Hazard HUD - floating top-left */}
              {hazards.length > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <HazardHUD hazards={hazards} />
                </div>
              )}

              {/* Timeline - floating bottom */}
              <div className="absolute bottom-0 left-0 right-80 z-10">
                <div className="mx-4 mb-4">
                  <Timeline
                    selectedLead={selectedLead}
                    onLeadChange={setSelectedLead}
                    frames={frames}
                  />
                </div>
              </div>
            </div>

            {/* Right panel: storms + detail */}
            <div className="w-80 flex flex-col border-l border-g-border bg-g-surface/80 backdrop-blur-sm">
              {/* Storm detail (if selected) */}
              {selectedStorm && storm && (
                <div className="border-b border-g-border">
                  <div className="p-3 flex items-center justify-between border-b border-g-border/50">
                    <span className="text-[10px] uppercase tracking-widest text-g-text-muted">Storm Intelligence</span>
                    <button
                      onClick={() => setSelectedStorm(null)}
                      className="text-g-text-muted hover:text-g-text text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <StormDetail storm={storm} />
                </div>
              )}

              {/* Storm list */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 border-b border-g-border/50">
                  <span className="text-[10px] uppercase tracking-widest text-g-text-muted">
                    Active Cells ({storms.length})
                  </span>
                </div>
                <StormList
                  storms={storms}
                  selectedId={selectedStorm}
                  onSelect={setSelectedStorm}
                />
              </div>
            </div>
          </>
        )}

        {/* ── STORMS ──────────────────────────────────────────── */}
        {screen === 'storms' && (
          <div className="flex-1 flex">
            <div className="flex-1 relative">
              <MapView
                storms={storms}
                selectedStormId={selectedStorm}
                onSelectStorm={setSelectedStorm}
              />
            </div>
            <div className="w-96 border-l border-g-border bg-g-surface/80 overflow-y-auto">
              <div className="p-4 border-b border-g-border">
                <h2 className="text-sm font-semibold">Storm Intelligence</h2>
                <p className="text-[10px] text-g-text-muted mt-1">{storms.length} active cells detected</p>
              </div>
              {storm ? (
                <StormDetail storm={storm} />
              ) : (
                <div className="p-4">
                  <StormList storms={storms} selectedId={selectedStorm} onSelect={setSelectedStorm} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REPLAY ──────────────────────────────────────────── */}
        {screen === 'replay' && <ReplayPanel />}

        {/* ── ALERTS ──────────────────────────────────────────── */}
        {screen === 'alerts' && <AlertDesk />}

        {/* ── VERIFICATION ────────────────────────────────────── */}
        {screen === 'verification' && <VerificationLab />}

        {/* ── DATA HEALTH ─────────────────────────────────────── */}
        {screen === 'data-health' && <DataHealth />}
      </div>
    </div>
  )
}
