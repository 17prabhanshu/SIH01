"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapComponentProps {
  lat: number;
  lon: number;
  geojson?: any;
}

export default function MapComponent({ lat, lon, geojson }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [lon, lat],
      zoom: 14
    });

    map.current.on('load', () => {
      // Add a hazard zone circle
      map.current?.addSource('hazard-zone', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            properties: {}
          }]
        }
      });

      map.current?.addLayer({
        id: 'hazard-zone-fill',
        type: 'circle',
        source: 'hazard-zone',
        paint: {
          'circle-radius': 150, // approx pixels for a radius
          'circle-color': '#ef4444',
          'circle-opacity': 0.2,
          'circle-stroke-color': '#ef4444',
          'circle-stroke-width': 2
        }
      });
      
      // Target point
      new maplibregl.Marker({ color: '#ef4444' })
        .setLngLat([lon, lat])
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lat, lon]);

  // Handle geojson updates
  useEffect(() => {
    if (!map.current || !geojson) return;
    
    // We wait for the map to load its style before adding new sources
    const addData = () => {
      const src = map.current?.getSource('critical-infrastructure') as maplibregl.GeoJSONSource;
      if (src) {
        src.setData(geojson);
      } else {
        map.current?.addSource('critical-infrastructure', {
          type: 'geojson',
          data: geojson
        });

        map.current?.addLayer({
          id: 'hospitals',
          type: 'circle',
          source: 'critical-infrastructure',
          filter: ['==', 'type', 'hospital'],
          paint: {
            'circle-radius': 8,
            'circle-color': '#3b82f6', // blue for hospitals
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });

        map.current?.addLayer({
          id: 'schools',
          type: 'circle',
          source: 'critical-infrastructure',
          filter: ['==', 'type', 'school'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#eab308', // yellow for schools
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      addData();
    } else {
      map.current.once('load', addData);
    }
  }, [geojson]);

  return <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm" />;
}
