'use client'

import { useEffect, useRef } from 'react'

/**
 * MapLibre GL map view.
 * Shows radar, satellite, lightning, storm polygons,
 * hazard heatmaps, exposure assets, Observability Index.
 */
export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // MapLibre initialization will go here
    // Using a placeholder for now
  }, [])

  return (
    <div ref={mapContainer} className="w-full h-full bg-garjana-dark relative">
      {/* Placeholder map */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <p className="text-gray-400">MapLibre GL Map</p>
          <p className="text-xs text-gray-600 mt-2">
            Layers: Radar | INSAT IR | Lightning | Storm Polygons | OI
          </p>
        </div>
      </div>

      {/* Layer toggles */}
      <div className="absolute top-4 right-4 bg-garjana-secondary/90 backdrop-blur rounded-lg p-2">
        <div className="text-xs font-semibold text-gray-400 mb-2">Layers</div>
        {['Radar', 'INSAT IR', 'Lightning', 'Storms', 'Hazards', 'OI', 'Exposure'].map(layer => (
          <label key={layer} className="flex items-center gap-2 text-xs text-gray-300 py-0.5">
            <input type="checkbox" defaultChecked className="rounded" />
            {layer}
          </label>
        ))}
      </div>
    </div>
  )
}
