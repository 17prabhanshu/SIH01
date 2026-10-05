"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  
  // Use MotionValues to bypass React render cycle entirely (0.01ms overhead)
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Smooth springs for the outer circle
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('interactive')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Use passive listener for extreme performance
    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[100] "
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-primary rounded-full pointer-events-none z-[99]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
