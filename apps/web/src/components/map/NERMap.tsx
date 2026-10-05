'use client';

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchApi } from '@/lib/api';

export default function NERMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (map.current) return;
    
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [92.0, 25.5],
        zoom: 6,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
      
      popupRef.current = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        className: 'dark-popup'
      });

      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        if (!popupRef.current || !map.current) return;
        
        popupRef.current.setLngLat([lng, lat])
          .setHTML(`<div style="padding: 16px; color: #f8fafc; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); font-family: 'Inter', sans-serif;">
            <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 8px; font-weight: 500;">Target Location</div>
            <div style="font-size: 14px; margin-bottom: 16px; font-medium; color: rgba(255,255,255,0.9);">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            <div style="color: #818cf8; font-size: 13px; display: flex; align-items: center; gap: 8px; font-weight: 500;">
               <div style="width: 14px; height: 14px; border: 2px solid #818cf8; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);"></div>
               Analyzing local terrain...
            </div>
          </div>`)
          .addTo(map.current);
          
        try {
          const res = await fetchApi<any>(`/risk/evaluate?lat=${lat}&lon=${lng}`);
          
          let riskColor = '#34d399'; // emerald-400
          let riskBg = 'rgba(16, 185, 129, 0.1)';
          let riskShadow = 'rgba(52, 211, 153, 0.2)';
          if (res.overall_risk === 'MODERATE') { riskColor = '#fbbf24'; riskBg = 'rgba(245, 158, 11, 0.1)'; riskShadow = 'rgba(251, 191, 36, 0.2)'; }
          if (res.overall_risk === 'HIGH') { riskColor = '#fb7185'; riskBg = 'rgba(225, 29, 72, 0.1)'; riskShadow = 'rgba(251, 113, 133, 0.2)'; }
          if (res.overall_risk === 'EXTREME') { riskColor = '#f43f5e'; riskBg = 'rgba(225, 29, 72, 0.1)'; riskShadow = 'rgba(244, 63, 94, 0.2)'; }
          if (res.overall_risk === 'BLOCKED' || res.overall_risk === 'UNAVAILABLE') { riskColor = '#94a3b8'; riskBg = 'rgba(148, 163, 184, 0.1)'; riskShadow = 'transparent'; }

          const mlScore = res.fusion_result?.calibrated_probability 
             ? (res.fusion_result.calibrated_probability * 100).toFixed(1) + '%' 
             : 'N/A';

          popupRef.current.setHTML(`
            <div style="padding: 16px; color: #f8fafc; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); min-width: 240px; font-family: 'Inter', sans-serif;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 6px; font-weight: 500;">Risk Assessment</div>
              <div style="font-size: 16px; font-weight: 600; color: ${riskColor}; margin-bottom: 16px; background: ${riskBg}; padding: 6px 12px; border-radius: 8px; border: 1px solid ${riskColor}40; box-shadow: 0 0 15px ${riskShadow}; display: inline-block; text-transform: capitalize;">
                ${(res.overall_risk || 'Unknown').toLowerCase()}
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 500;">AI Confidence</div>
                  <div style="font-size: 14px; margin-top: 4px; font-weight: 600;">${mlScore}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 500;">Elevation</div>
                  <div style="font-size: 14px; margin-top: 4px; font-weight: 600;">${res.fusion_result?.elevation !== null ? Math.round(res.fusion_result?.elevation) + 'm' : 'N/A'}</div>
                </div>
              </div>
            </div>
          `);
        } catch (err) {
          popupRef.current.setHTML(`<div style="padding: 16px; color: #f8fafc; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); font-family: 'Inter', sans-serif;">
            <div style="color: #f43f5e; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <svg style="width: 16px; height: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Connection Interrupted
            </div>
            <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 6px;">Failed to evaluate risk at this location.</div>
          </div>`);
        }
      });
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .dark-popup .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0;
        }
        .dark-popup .maplibregl-popup-tip {
          display: none;
        }
        .dark-popup .maplibregl-popup-close-button {
          color: rgba(255,255,255,0.5);
          font-size: 16px;
          padding: 8px 12px;
          z-index: 10;
        }
        .dark-popup .maplibregl-popup-close-button:hover {
          background: transparent;
          color: white;
        }
      `}</style>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </>
  );
}
