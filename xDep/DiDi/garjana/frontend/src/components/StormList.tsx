'use client'

import TierBadge from './TierBadge'

/**
 * Storm list sorted by priority.
 * Each hazard card shows tier badge (R3).
 */
export default function StormList() {
  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Storms</h3>

      {/* Placeholder storm card */}
      <div className="bg-garjana-dark rounded-lg p-3 mb-2 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm">S-001</span>
          <span className="text-xs text-gray-500">Track: T-001</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Zmax:</span>
            <span className="ml-1">52 dBZ</span>
          </div>
          <div>
            <span className="text-gray-500">Area:</span>
            <span className="ml-1">128 km²</span>
          </div>
          <div>
            <span className="text-gray-500">VIL:</span>
            <span className="ml-1">35 kg/m²</span>
          </div>
          <div>
            <span className="text-gray-500">Motion:</span>
            <span className="ml-1">45 km/h NE</span>
          </div>
        </div>

        {/* Hazard cards with tier badges */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs">Lightning: 0.72</span>
            <TierBadge tier="proxy" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Heavy Rain: 0.65</span>
            <TierBadge tier="validated" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Hail-favourable: 0.31</span>
            <TierBadge tier="experimental" />
          </div>
        </div>

        {/* ETA - never a bare number (R1) */}
        <div className="mt-2 p-2 bg-garjana-secondary rounded text-xs">
          <div className="text-amber-400 font-semibold">ETA to Airport</div>
          <div>Median: 24 min (10-90%: 17-33 min)</div>
          <div>P(impact ≤60 min): 0.75</div>
        </div>
      </div>

      <p className="text-xs text-gray-600 text-center mt-4">
        Placeholder data — connect to API for live storms
      </p>
    </div>
  )
}
