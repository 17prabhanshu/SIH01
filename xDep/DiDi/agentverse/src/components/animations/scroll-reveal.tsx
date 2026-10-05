"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode; 
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const initialValues = {
    up: { y: 60, opacity: 0 },
    down: { y: -60, opacity: 0 },
    left: { x: 60, opacity: 0 },
    right: { x: -60, opacity: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial={initialValues[direction]}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : initialValues[direction]}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
