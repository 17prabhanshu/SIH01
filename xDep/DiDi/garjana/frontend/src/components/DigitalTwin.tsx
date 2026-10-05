'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Activity } from 'lucide-react'

import Spline from '@splinetool/react-spline/next'

export default function DigitalTwin({ intensity = 'moderate' }: { intensity?: 'weak' | 'moderate' | 'severe' }) {
  const splineRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)

  function onLoad(splineApp: any) {
    splineRef.current = splineApp
    setLoading(false)
  }

  // Update Spline variables if possible (depends on the public scene)
  useEffect(() => {
    if (splineRef.current) {
      try {
        splineRef.current.setVariable('intensity', intensity === 'severe' ? 3 : intensity === 'moderate' ? 2 : 1)
      } catch (e) {
        // Variable might not exist in the public scene, safely ignore
      }
    }
  }, [intensity])

  return (
    <div className="relative w-full h-[400px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
      
      {/* 3D Scene */}
      <Spline
        scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
        onLoad={onLoad}
        className="w-full h-full"
      />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Initializing WebGL Engine...</div>
          </div>
        </div>
      )}

      {/* Glassmorphic HUD overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none p-4 rounded-xl bg-zinc-950/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">Sector 4 Digital Twin</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3">
          <div className="text-[10px] text-zinc-400">Soil Saturation</div>
          <div className="text-[10px] font-mono font-medium text-amber-400 text-right">84% (CRITICAL)</div>
          <div className="text-[10px] text-zinc-400">Slope Deformation</div>
          <div className="text-[10px] font-mono font-medium text-zinc-300 text-right">1.2 mm/day</div>
          <div className="text-[10px] text-zinc-400">Runoff Potential</div>
          <div className="text-[10px] font-mono font-medium text-red-400 text-right">HIGH</div>
        </div>
      </div>
      
      {/* Live Data Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-full backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Live Simulation</span>
        </div>
      </div>
      
      {/* Interactive Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-zinc-950/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-zinc-400">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  )
}
