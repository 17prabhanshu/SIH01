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
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {},
          },
        ],
      },
      center: [80.5, 26.7],
      zoom: 5,
      minZoom: 3,
      maxZoom: 15,
    })

    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    m.on('load', () => {
      // Darken the basemap
      m.getCanvas().style.filter = 'brightness(0.3) contrast(1.3) saturate(0.15)'

      // Add storms source
      m.addSource('storms', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      // Storm fill circles
      m.addLayer({
        id: 'storms-fill',
        type: 'circle',
        source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 16, 5, 500, 10, 2000, 18, 5000, 28],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'zmax'],
            25, '#22d3ee',
            35, '#f59e0b',
            45, '#f97316',
            55, '#f43f5e',
          ],
          'circle-opacity': 0.7,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'interpolate', ['linear'], ['get', 'zmax'],
            25, 'rgba(34,211,238,0.5)',
            35, 'rgba(245,158,11,0.5)',
            45, 'rgba(249,115,22,0.5)',
            55, 'rgba(244,63,94,0.5)',
          ],
        },
      })

      // Storm glow layer (behind)
      m.addLayer({
        id: 'storms-glow',
        type: 'circle',
        source: 'storms',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'area'], 16, 12, 500, 20, 2000, 30, 5000, 45],
          'circle-color': [
            'interpolate', ['linear'], ['get', 'zmax'],
            25, 'rgba(34,211,238,0.08)',
            35, 'rgba(245,158,11,0.08)',
            45, 'rgba(249,115,22,0.1)',
            55, 'rgba(244,63,94,0.12)',
          ],
          'circle-blur': 1,
        },
      }, 'storms-fill')

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

      // Hover popup
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
            <div style="font-family:Inter,sans-serif;font-size:11px;line-height:1.6">
              <div style="font-weight:600;color:#e8eaf0;margin-bottom:4px">${p.id}</div>
              <div style="color:#8b8fa3">Zmax <span style="color:#e8eaf0;font-weight:600;font-family:monospace">${parseFloat(p.zmax).toFixed(1)}</span> dBZ</div>
              <div style="color:#8b8fa3">Area <span style="color:#e8eaf0;font-family:monospace">${parseFloat(p.area).toFixed(0)}</span> km²</div>
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
        selected: s.storm_id === selectedStormId ? 1 : 0,
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
      duration: 1200,
    })
  }, [selectedStormId, storms])

  return (
    <div className={"relative w-full h-full bg-g-bg overflow-hidden " + className}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ boxShadow: 'inset 0 0 120px rgba(10,11,15,0.8)' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}
