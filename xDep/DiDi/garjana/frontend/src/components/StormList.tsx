'use client'

import { useState, useEffect } from 'react'
import TierBadge from './TierBadge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface Storm {
  storm_id: string
  centroid_lat: number
  centroid_lon: number
  area_km2: number
  zmax: number
  timestamp: string | null
}

export default function StormList() {
  const [storms, setStorms] = useState<Storm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/storms`)
      .then(res => res.json())
      .then(data => {
        if (data.storms) {
          setStorms(data.storms)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Set up polling every 10 seconds for replay demo
    const interval = setInterval(() => {
      fetch(`${API_URL}/storms`)
        .then(res => res.json())
        .then(data => {
          if (data.storms) setStorms(data.storms)
        })
        .catch(console.error)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="p-3 text-xs text-gray-500">Loading active storms...</div>
  }

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Storms ({storms.length})</h3>

      {storms.length === 0 ? (
        <p className="text-xs text-gray-600 text-center mt-4">
          Awaiting data...
        </p>
      ) : (
        storms.map(storm => (
          <div key={storm.storm_id} className="bg-garjana-dark rounded-lg p-3 mb-2 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm">{storm.storm_id}</span>
              {storm.timestamp && <span className="text-xs text-gray-500">{storm.timestamp.split('T')[1]}</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Zmax:</span>
                <span className="ml-1">{Math.round(storm.zmax)} dBZ</span>
              </div>
              <div>
                <span className="text-gray-500">Area:</span>
                <span className="ml-1">{Math.round(storm.area_km2)} km²</span>
              </div>
              <div>
                <span className="text-gray-500">Lat:</span>
                <span className="ml-1">{storm.centroid_lat.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Lon:</span>
                <span className="ml-1">{storm.centroid_lon.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
