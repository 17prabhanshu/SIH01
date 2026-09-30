'use client'

import { useState, useEffect } from 'react'
import ModeBanner from '@/components/ModeBanner'
import Sidebar from '@/components/Sidebar'
import MapView from '@/components/MapView'
import StormList from '@/components/StormList'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface HealthData {
  status: string
  run_mode: string
  system_mode: string
  version: string
}

export default function ControlRoom() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [activeScreen, setActiveScreen] = useState<string>('control-room')
  const [selectedLead, setSelectedLead] = useState<number>(0)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({
        status: 'disconnected',
        run_mode: 'REPLAY',
        system_mode: 'BASELINE',
        version: '0.1.0'
      }))
  }, [])

  return (
    <div className="flex flex-col h-screen">
      {/* R9: Mode banner ALWAYS visible */}
      <ModeBanner
        runMode={health?.run_mode || 'REPLAY'}
        systemMode={health?.system_mode || 'BASELINE'}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {activeScreen === 'control-room' && (
            <div className="flex-1 flex">
              {/* Map */}
              <div className="flex-1 relative">
                <MapView />
                {/* Time scrubber */}
                <div className="absolute bottom-4 left-4 right-4 bg-garjana-secondary/90 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">Lead time:</span>
                    <input
                      type="range"
                      min={-60}
                      max={360}
                      step={10}
                      value={selectedLead}
                      onChange={e => setSelectedLead(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono min-w-[80px] text-right">
                      {selectedLead <= 0
                        ? `${Math.abs(selectedLead)} min ago`
                        : selectedLead <= 120
                          ? `+${selectedLead} min`
                          : `+${selectedLead} min (outlook)`
                      }
                    </span>
                  </div>
                  {selectedLead > 120 && (
                    <p className="text-xs text-amber-400 mt-1">
                      ⚠ Environment outlook (2-6h): coarse resolution, not cell-level
                    </p>
                  )}
                </div>
              </div>

              {/* Storm list */}
              <div className="w-80 bg-garjana-secondary border-l border-gray-700 overflow-y-auto">
                <StormList />
              </div>
            </div>
          )}

          {activeScreen === 'storm-detail' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Storm Detail</h2>
              <p className="text-gray-400">Select a storm from the Control Room to view details.</p>
            </div>
          )}

          {activeScreen === 'asset-watch' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Asset Watch</h2>
              <p className="text-gray-400">Subscribed assets and ETA bands.</p>
            </div>
          )}

          {activeScreen === 'alert-desk' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Alert Desk</h2>
              <p className="text-gray-400">Draft queue → review → approve → CAP preview.</p>
              <div className="mt-4 grid gap-4">
                <div className="bg-garjana-dark rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold text-amber-400">Draft Queue</h3>
                  <p className="text-gray-500 text-sm mt-2">No draft alerts. R10: Alerts require human approval.</p>
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'verification' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Verification Scoreboard</h2>
              <p className="text-gray-400">Live scores vs baselines by lead time.</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-garjana-dark rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold">CSI vs Lead Time</h3>
                  <p className="text-gray-500 text-xs mt-1">Baseline vs model comparison</p>
                </div>
                <div className="bg-garjana-dark rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold">Reliability Diagram</h3>
                  <p className="text-gray-500 text-xs mt-1">Probabilistic calibration</p>
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'data-health' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Data Health</h2>
              <p className="text-gray-400">Per-source freshness, fidelity, QC flags.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
