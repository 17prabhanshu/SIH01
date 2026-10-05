"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { ReactLenis } from "@studio-freight/react-lenis";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ 
      lerp: 0.15, 
      duration: 1.2, 
      smoothWheel: true, 
      wheelMultiplier: 1.1 
    }}>
      <ProgressBar
        height="4px"
        color="var(--color-primary)"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children as any}
    </ReactLenis>
  );
}
