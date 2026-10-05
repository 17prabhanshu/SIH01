'use client'

import { useEffect, useRef } from 'react'
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
      center: [78.0, 22.0],
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 14,
      pitch: 30,
      bearing: -5,
    })

    m.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right')

    m.on('load', () => {
      m.addSource('storms', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })


      // Storm Heatmap (Radar Contours)
      m.addLayer({
        id: 'storm-heatmap', type: 'heatmap', source: 'storms',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'zmax'], 30, 0, 60, 1],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 1, 14, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(59,130,246,0.5)',
            0.4, 'rgba(245,158,11,0.6)',
            0.7, 'rgba(249,115,22,0.8)',
            1, 'rgba(239,68,68,0.9)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 15, 14, 50],
          'heatmap-opacity': 0.8
        }
      }, 'waterway') # Insert below labels if possible, but MapLibre might not have 'waterway' on carto raster, so just append

      // Core marker

      m.addLayer({
        id: 'storms-core', type: 'circle', source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 10, 5, 500, 10, 5000, 20],
          'circle-color': ['interpolate', ['linear'], ['get', 'zmax'],
            25, '#3b82f6', 35, '#f59e0b', 45, '#f97316', 55, '#ef4444'],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(255,255,255,0.3)',
          'circle-pitch-alignment': 'map',
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
        const severity = zmax > 50 ? 'Severe' : zmax > 40 ? 'Significant' : zmax > 30 ? 'Moderate' : 'Weak'
        const color = zmax > 50 ? '#ef4444' : zmax > 40 ? '#f97316' : zmax > 30 ? '#f59e0b' : '#3b82f6'

        if (!popup.current) popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 })

        popup.current.setLngLat(coords).setHTML(`
          <div style="min-width:180px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>
              <span style="font-size:13px;font-weight:600;color:#fafafa">${severity} Convective Cell</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr auto;gap:6px;font-size:12px">
              <span style="color:#a1a1aa">Max Reflectivity</span>
              <span style="font-weight:600;font-family:'JetBrains Mono';color:${color}">${zmax.toFixed(1)} dBZ</span>
              <span style="color:#a1a1aa">Cell Area</span>
              <span style="font-weight:500;font-family:'JetBrains Mono'">${parseFloat(p.area).toFixed(0)} km²</span>
            </div>
          </div>
        `).addTo(m)
      })
    })

    map.current = m
    return () => { m.remove(); map.current = null }
  }, [])

useEffect(() => {
    const m = map.current
    if (!m) return
    
    const updateData = () => {
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
    }
    
    if (m.isStyleLoaded()) {
      updateData()
    } else {
      m.once('styledata', updateData)
    }
  }, [storms])

  useEffect(() => {
    if (!selectedStormId || !map.current) return
    const s = storms.find(x => x.storm_id === selectedStormId)
    if (s) map.current.flyTo({ center: [s.centroid_lon, s.centroid_lat], zoom: 8, duration: 1200, pitch: 45 })
  }, [selectedStormId, storms])

  return <div ref={container} className="w-full h-full" />
}
