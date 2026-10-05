"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

export function AnimatedHero({ title, subtitle }: { title: string; subtitle: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      // Split text into words/letters for anime.js
      const text = titleRef.current.innerText;
      titleRef.current.innerHTML = text.replace(/\S/g, "<span class='letter inline-block opacity-0 translate-y-8'>$&</span>");

      anime.timeline({ loop: false })
        .add({
          targets: '.letter',
          translateY: [40, 0],
          translateZ: 0,
          opacity: [0, 1],
          easing: "easeOutExpo",
          duration: 1200,
          delay: (el: HTMLElement, i: number) => 30 * i
        })
        .add({
          targets: subtitleRef.current,
          opacity: [0, 1],
          translateY: [20, 0],
          easing: "easeOutExpo",
          duration: 1000,
        }, "-=800");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 
        ref={titleRef} 
        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-foreground max-w-4xl text-center leading-[1.1]"
      >
        {title}
      </h1>
      <p 
        ref={subtitleRef} 
        className="opacity-0 text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-center font-medium"
      >
        {subtitle}
      </p>
    </div>
  );
}
