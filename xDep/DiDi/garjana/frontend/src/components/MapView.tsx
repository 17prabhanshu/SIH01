'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Storm } from '@/lib/api'

interface Props {
  storms?: Storm[]
  selectedStormId?: string | null
  onSelectStorm?: (id: string) => void
}

export default function MapView({ storms = [], selectedStormId, onSelectStorm }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popup = useRef<maplibregl.Popup | null>(null)

  useEffect(() => {
    if (map.current || !container.current) return

    const m = new maplibregl.Map({
      container: container.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4a82_1_54ed6262c0ce94e01e267b3c'],
            tileSize: 256,
            attribution: '&copy; CARTO',
          },
        },
        layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
      },
      center: [77.5, 22.0],
      zoom: 4.8,
      minZoom: 3,
      maxZoom: 14,
    })

    m.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right')

    m.on('load', () => {
      m.addSource('storms', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      // Meteorological Cell Display (Clean & Professional)
      m.addLayer({
        id: 'storms-core', type: 'circle', source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 10, 6, 500, 12, 5000, 24],
          'circle-color': ['interpolate', ['linear'], ['get', 'zmax'], 25, '#38bdf8', 35, '#facc15', 45, '#f97316', 55, '#ef4444'],
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      m.on('click', 'storms-core', (e) => {
        if (e.features?.[0]?.properties?.id && onSelectStorm) onSelectStorm(e.features[0].properties.id)
      })

      m.on('mouseenter', 'storms-core', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'storms-core', () => {
        m.getCanvas().style.cursor = ''
        popup.current?.remove()
      })

      m.on('mousemove', 'storms-core', (e) => {
        if (!e.features?.[0]) return
        const p = e.features[0].properties!
        const coords = (e.features[0].geometry as any).coordinates
        const zmax = parseFloat(p.zmax)
        
        if (!popup.current) popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

        popup.current.setLngLat(coords).setHTML(`
          <div>
            <div style="font-size:14px;font-weight:600;margin-bottom:8px;color:#0f172a;">Convective Cell</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;gap:16px;">
              <span style="font-size:12px;color:#64748b">Max Reflectivity</span>
              <span style="font-size:12px;font-weight:600;color:${zmax > 45 ? '#ea580c' : '#0f172a'}">${zmax.toFixed(1)} dBZ</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:12px;color:#64748b">Cell Area</span>
              <span style="font-size:12px;color:#0f172a">${parseFloat(p.area).toFixed(0)} km²</span>
            </div>
          </div>
        `).addTo(m)
      })
    })

    map.current = m
    return () => { m.remove(); map.current = null }
  }, []) // eslint-disable-line

  useEffect(() => {
    const m = map.current
    if (!m?.isStyleLoaded()) return
    const src = m.getSource('storms') as maplibregl.GeoJSONSource
    if (!src) return

    src.setData({
      type: 'FeatureCollection',
      features: storms.map(s => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [s.centroid_lon, s.centroid_lat] },
        properties: { id: s.storm_id, zmax: s.zmax, area: s.area_km2 },
      })),
    })
  }, [storms])

  useEffect(() => {
    if (!selectedStormId || !map.current) return
    const s = storms.find(x => x.storm_id === selectedStormId)
    if (s) map.current.flyTo({ center: [s.centroid_lon, s.centroid_lat], zoom: 8, duration: 1200 })
  }, [selectedStormId, storms])

  return <div ref={container} className="w-full h-full bg-slate-100" />
}
