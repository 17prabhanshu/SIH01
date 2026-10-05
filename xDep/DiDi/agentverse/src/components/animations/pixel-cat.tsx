"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CAT_PALETTES = [
  { primary: '#fca5a5', chest: '#fee2e2', dark: '#b91c1c' }, // Pastel Red
  { primary: '#a7f3d0', chest: '#ecfdf5', dark: '#047857' }, // Pastel Emerald
  { primary: '#bfdbfe', chest: '#eff6ff', dark: '#1d4ed8' }, // Pastel Blue
  { primary: '#fcd34d', chest: '#fffbeb', dark: '#b45309' }, // Pastel Amber
  { primary: '#d8b4fe', chest: '#faf5ff', dark: '#7e22ce' }, // Pastel Purple
  { primary: '#cbd5e1', chest: '#f8fafc', dark: '#334155' }, // Slate
];

export function PixelCat() {
  const [path, setPath] = useState<{ x: number; y: number } | null>(null);
  const [action, setAction] = useState<'idle' | 'look-left' | 'look-right' | 'sleepy'>('idle');
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [palette, setPalette] = useState(CAT_PALETTES[0]);
  const lastTeleportTime = useRef(Date.now());

  const getSafePosition = () => {
    // Generate coordinates on the extreme left or right margins of the viewport
    // to ensure it NEVER covers center text or main content.
    const isLeft = Math.random() > 0.5;
    let targetX = 0;
    let targetY = 0;

    if (typeof window !== 'undefined') {
      const marginWidth = Math.max(20, (window.innerWidth - 1200) / 2);
      // If screen is narrow (mobile), stick to the very bottom corners
      if (window.innerWidth < 1024) {
        targetX = isLeft ? 20 : window.innerWidth - 70;
        targetY = window.innerHeight - 100;
      } else {
        targetX = isLeft 
          ? 20 + Math.random() * (marginWidth > 100 ? 100 : marginWidth) 
          : window.innerWidth - 70 - Math.random() * (marginWidth > 100 ? 100 : marginWidth);
        targetY = 150 + Math.random() * (window.innerHeight - 300);
      }
    }
    return { x: targetX, y: targetY };
  };

  const pathRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Initial spawn (Run once)
    const initialPos = getSafePosition();
    setPath(initialPos);
    pathRef.current = initialPos;
    
    const handleMouseOver = (e: MouseEvent) => {
      if (!pathRef.current) return;
      const dx = e.clientX - pathRef.current.x;
      const dy = e.clientY - pathRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 120) {
        if (Date.now() - lastTeleportTime.current > 4000) {
          lastTeleportTime.current = Date.now();
          const randomColor = CAT_PALETTES[Math.floor(Math.random() * CAT_PALETTES.length)];
          setPalette(randomColor);
          
          const newPos = getSafePosition();
          setPath(newPos);
          pathRef.current = newPos;
          setAction('idle'); 
        }
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  useEffect(() => {
    if (!path) return;
    const interval = setInterval(() => {
      const actions: typeof action[] = ['idle', 'look-left', 'look-right', 'sleepy', 'idle', 'idle'];
      setAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 2500); 
    return () => clearInterval(interval);
  }, [path]);

  const playMeow = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  };

  const handleCatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMeow();
    setAction('idle'); 
    
    const newHearts = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 40,
    }));
    
    setHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setHearts((prev) => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1500);
  };

  const eyeOffset = action === 'look-left' ? -1 : action === 'look-right' ? 1 : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-visible">
      <style>{`
        @keyframes cat-breathe {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(0.96) translateY(0.3px); }
        }
        @keyframes cat-blink {
          0%, 94%, 100% { transform: scaleY(1); }
          97% { transform: scaleY(0.1); }
        }
        @keyframes cat-tail {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
      `}</style>

      <AnimatePresence mode="wait">
        {path && (
          <motion.div
            key={`${path.x}-${path.y}`}
            initial={{ scale: 0.2, opacity: 0, x: path.x, y: path.y + 15 }}
            animate={{ scale: 1, opacity: 1, x: path.x, y: path.y }}
            exit={{ scale: 0.2, opacity: 0, x: path.x, y: path.y + 10, transition: { duration: 0.15, ease: "easeIn" } }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.5 }}
            className="absolute top-0 left-0 w-[48px] h-[48px] pointer-events-auto cursor-pointer flex items-end justify-center group"
            onClick={handleCatClick}
            title="Meow!"
            style={{ transformOrigin: "bottom center" }}
          >
            <svg 
              viewBox="0 0 16 16" 
              width="48" 
              height="48" 
              shapeRendering="crispEdges" 
              className="drop-shadow-lg transition-transform group-hover:scale-110 origin-bottom"
            >
              <g style={{ transformOrigin: '12.5px 14px', animation: 'cat-tail 2.5s infinite ease-in-out' }}>
                <rect x="12" y="10" width="1" height="4" fill={palette.dark} />
                <rect x="13" y="8" width="1" height="2" fill={palette.dark} />
                <rect x="12" y="7" width="2" height="1" fill={palette.dark} />
              </g>

              <rect x="4" y="9" width="8" height="6" fill={palette.primary} />
              <rect x="6" y="10" width="4" height="4" fill={palette.chest} opacity="0.9" />

              <rect x="3" y="14" width="2" height="1" fill={palette.chest} />
              <rect x="11" y="14" width="2" height="1" fill={palette.chest} />

              <g style={{ transformOrigin: '8px 10px', animation: 'cat-breathe 2s infinite ease-in-out' }}>
                <rect x="3" y="4" width="10" height="6" fill={palette.primary} />
                
                <rect x="3" y="2" width="2" height="2" fill={palette.dark} />
                <rect x="11" y="2" width="2" height="2" fill={palette.dark} />
                
                <rect x="4" y="3" width="1" height="1" fill="#fbcfe8" />
                <rect x="11" y="3" width="1" height="1" fill="#fbcfe8" />

                <g style={{ transformOrigin: '8px 7px', animation: action === 'sleepy' ? 'none' : 'cat-blink 5s infinite' }}>
                  {action === 'sleepy' ? (
                    <>
                      <rect x="4" y="7" width="2" height="1" fill="#171717" />
                      <rect x="10" y="7" width="2" height="1" fill="#171717" />
                    </>
                  ) : (
                    <g style={{ transform: `translateX(${eyeOffset}px)`, transition: 'transform 0.2s ease-in-out' }}>
                      <rect x="4" y="6" width="2" height="2" fill="#171717" />
                      <rect x="4" y="6" width="1" height="1" fill="#ffffff" />
                      
                      <rect x="10" y="6" width="2" height="2" fill="#171717" />
                      <rect x="10" y="6" width="1" height="1" fill="#ffffff" />
                    </g>
                  )}
                </g>

                <rect x="7" y="7" width="2" height="1" fill="#f472b6" />
                <rect x="7" y="8" width="2" height="1" fill={palette.chest} />
              </g>
            </svg>

            <AnimatePresence>
              {hearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, x: heart.x, scale: 0 }}
                  animate={{ opacity: 0, y: -60 + heart.y, scale: 2.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 text-pink-500 pointer-events-none drop-shadow-md"
                  style={{ marginLeft: "-8px" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
