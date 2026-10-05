"use client";

import React, { useRef, useEffect } from "react";
import anime from "animejs";

export function Marquee({ children, speed = 50 }: { children: React.ReactNode; speed?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const content = containerRef.current.firstElementChild as HTMLElement;
    if (!content) return;
    
    // Duplicate the content to make it seamless
    containerRef.current.appendChild(content.cloneNode(true));
    
    const contentWidth = content.offsetWidth;
    const duration = (contentWidth / speed) * 1000;

    anime({
      targets: containerRef.current.children,
      translateX: -contentWidth,
      duration: duration,
      easing: "linear",
      loop: true,
    });
  }, [speed]);

  return (
    <div className="overflow-hidden w-full relative flex py-8 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[100px] before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[100px] after:bg-gradient-to-l after:from-background after:to-transparent">
      <div ref={containerRef} className="flex gap-6 whitespace-nowrap will-change-transform">
        <div className="flex gap-6 min-w-max">
          {children}
        </div>
      </div>
    </div>
  );
}
