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

  const getColor = useCallback((z: number) => z > 55 ? '#ef4444' : z > 45 ? '#f97316' : z > 35 ? '#f59e0b' : '#06b6d4', [])

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
      pitch: 62, // 3D tilt
      bearing: 15,
      fadeDuration: 200,
    })

    // Cinematic Auto-rotation
    let animationId: number
    const rotateCamera = () => {
      if (!map.current) return
      map.current.setBearing(map.current.getBearing() - 0.05)
      animationId = requestAnimationFrame(rotateCamera)
    }
    
    m.on('load', () => {
      rotateCamera()
      
      m.addSource('storms', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

      // Extruded 3D glow columns (simulating volumetric radar)
      m.addLayer({
        id: 'storm-volumetric', type: 'circle', source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 16, 20, 500, 30, 2000, 45, 5000, 70],
          'circle-color': ['interpolate', ['linear'], ['get', 'zmax'], 25, 'rgba(255,255,255,0.02)', 45, 'rgba(255,255,255,0.08)', 55, 'rgba(255,100,100,0.1)'],
          'circle-blur': 1.5,
          'circle-pitch-alignment': 'map',
        },
      })

      // Sharp Core
      m.addLayer({
        id: 'storms-main', type: 'circle', source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 16, 4, 500, 8, 2000, 12, 5000, 20],
          'circle-color': '#ffffff',
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255,255,255,0.5)',
          'circle-pitch-alignment': 'map',
        },
      })

      // Click
      m.on('click', 'storms-main', (e) => {
        if (e.features?.[0]?.properties?.id && onSelectStorm) onSelectStorm(e.features[0].properties.id)
      })

      m.on('mouseenter', 'storms-main', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'storms-main', () => {
        m.getCanvas().style.cursor = ''
        popup.current?.remove()
      })

      // Hover popup
      m.on('mousemove', 'storms-main', (e) => {
        if (!e.features?.[0]) return
        const p = e.features[0].properties!
        const coords = (e.features[0].geometry as any).coordinates
        const zmax = parseFloat(p.zmax)
        const severity = zmax > 50 ? 'Severe' : zmax > 40 ? 'Strong' : zmax > 30 ? 'Moderate' : 'Weak'

        if (!popup.current) popup.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: '200px' })

        popup.current.setLngLat(coords).setHTML(`
          <div style="font-family:Inter,sans-serif">
            <div style="font-size:13px;font-weight:600;color:#f9fafb;margin-bottom:6px">${severity} Storm Cell</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:11px;color:#9ca3af">Intensity</span>
              <span style="font-size:11px;font-weight:600;color:${p.zmax > 45 ? '#f97316' : '#f59e0b'}">${zmax.toFixed(1)} dBZ</span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="font-size:11px;color:#9ca3af">Area</span>
              <span style="font-size:11px;color:#f9fafb">${parseFloat(p.area).toFixed(0)} km²</span>
            </div>
          </div>
        `).addTo(m)
      })
    })

    map.current = m
    return () => { m.remove(); map.current = null }
  }, []) // eslint-disable-line

  // Update data
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

  // Fly to selected
  useEffect(() => {
    if (!selectedStormId || !map.current) return
    const s = storms.find(x => x.storm_id === selectedStormId)
    if (s) map.current.flyTo({ center: [s.centroid_lon, s.centroid_lat], zoom: 7.5, duration: 1000 })
  }, [selectedStormId, storms])

  return <div ref={container} className="w-full h-full" />
}
