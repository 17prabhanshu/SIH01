'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Storm } from '@/lib/api'

interface MapViewProps {
  storms?: Storm[]
  selectedStormId?: string | null
  onSelectStorm?: (id: string) => void
  className?: string
}

export default function MapView({ storms = [], selectedStormId, onSelectStorm, className = '' }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const m = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'carto-dark',
            type: 'raster',
            source: 'carto',
            paint: {},
          },
        ],
      },
      center: [80.5, 26.7],
      zoom: 5,
      minZoom: 3,
      maxZoom: 12,
    })

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    m.on('load', () => {
      // Add storms source
      m.addSource('storms', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      // Clean, simple storm circles
      m.addLayer({
        id: 'storms-fill',
        type: 'circle',
        source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 16, 6, 500, 12, 2000, 20, 5000, 30],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'zmax'],
            25, '#3b82f6', // blue
            35, '#f59e0b', // amber
            45, '#f97316', // orange
            55, '#ef4444', // red
          ],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      // Click handler
      m.on('click', 'storms-fill', (e) => {
        if (e.features?.[0]?.properties?.id && onSelectStorm) {
          onSelectStorm(e.features[0].properties.id)
        }
      })

      // Hover cursor
      m.on('mouseenter', 'storms-fill', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'storms-fill', () => {
        m.getCanvas().style.cursor = ''
        popupRef.current?.remove()
      })

      // Hover popup with plain English
      m.on('mousemove', 'storms-fill', (e) => {
        if (!e.features?.[0]) return
        const p = e.features[0].properties!
        const coords = (e.features[0].geometry as any).coordinates

        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })
        }

        popupRef.current
          .setLngLat(coords)
          .setHTML(`
            <div style="font-family:inherit;font-size:13px;line-height:1.6;">
              <div style="font-weight:600;margin-bottom:6px;border-bottom:1px solid #334155;padding-bottom:4px;">Storm Cell ${p.id}</div>
              <div style="display:flex;justify-content:space-between;gap:12px;">
                <span style="color:#94a3b8">Intensity:</span>
                <span style="font-weight:500">${parseFloat(p.zmax).toFixed(1)} dBZ</span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:12px;">
                <span style="color:#94a3b8">Size:</span>
                <span style="font-weight:500">${parseFloat(p.area).toFixed(0)} sq km</span>
              </div>
            </div>
          `)
          .addTo(m)
      })
    })

    mapRef.current = m

    return () => {
      m.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update storm data
  useEffect(() => {
    const m = mapRef.current
    if (!m || !m.isStyleLoaded()) return

    const src = m.getSource('storms') as maplibregl.GeoJSONSource
    if (!src) return

    const features = storms.map(s => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [s.centroid_lon, s.centroid_lat],
      },
      properties: {
        id: s.storm_id,
        zmax: s.zmax,
        area: s.area_km2,
      },
    }))

    src.setData({ type: 'FeatureCollection', features })
  }, [storms, selectedStormId])

  // Fly to selected storm
  useEffect(() => {
    if (!selectedStormId || !mapRef.current) return
    const storm = storms.find(s => s.storm_id === selectedStormId)
    if (!storm) return

    mapRef.current.flyTo({
      center: [storm.centroid_lon, storm.centroid_lat],
      zoom: 8,
      duration: 1000,
    })
  }, [selectedStormId, storms])

  return (
    <div className={"relative w-full h-full bg-g-bg overflow-hidden " + className}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
