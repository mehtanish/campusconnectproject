'use client';

import React, { useEffect, useRef } from 'react';

export function CartoonPlaneBackground() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const trailPathRef = useRef<SVGPathElement | null>(null);
  const planeGroupRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    const plane = planeGroupRef.current;
    const trail = trailPathRef.current;
    if (!path || !plane) return;

    let animationFrameId: number;
    const totalLength = path.getTotalLength();
    const duration = 14000; // 14 seconds per loop
    const pauseDuration = 2000; // 2 seconds pause at loop end
    let startTime: number | null = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Freeze plane at a fixed position along the path (35%)
      const pt = path.getPointAtLength(totalLength * 0.35);
      const ptAhead = path.getPointAtLength(totalLength * 0.35 + 2);
      const angle = (Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * 180) / Math.PI;
      plane.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
      plane.style.opacity = '0.75';
      if (trail) {
        trail.style.strokeDasharray = `150 ${totalLength}`;
        trail.style.strokeDashoffset = (-totalLength * 0.35 + 150).toString();
        trail.style.opacity = '0.3';
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % (duration + pauseDuration);

      if (elapsed > duration) {
        // Pause and fade out briefly between loop passes
        const fadeRatio = 1 - (elapsed - duration) / pauseDuration;
        plane.style.opacity = Math.max(0, fadeRatio * 0.75).toString();
        if (trail) trail.style.opacity = Math.max(0, fadeRatio * 0.3).toString();
      } else {
        const progress = elapsed / duration;
        const currentDist = progress * totalLength;
        const pt = path.getPointAtLength(currentDist);
        const ptAhead = path.getPointAtLength(Math.min(totalLength, currentDist + 3));

        const dx = ptAhead.x - pt.x;
        const dy = ptAhead.y - pt.y;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        // Smooth opacity ramp at start and end of flight path
        let opacity = 0.8;
        if (progress < 0.08) {
          opacity = (progress / 0.08) * 0.8;
        } else if (progress > 0.92) {
          opacity = ((1 - progress) / 0.08) * 0.8;
        }

        plane.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
        plane.style.opacity = opacity.toString();

        // Update trailing dashed path behind plane
        if (trail) {
          const trailLen = Math.min(currentDist, 180);
          trail.style.strokeDasharray = `${trailLen} ${totalLength}`;
          trail.style.strokeDashoffset = (-currentDist + trailLen).toString();
          trail.style.opacity = (opacity * 0.35).toString();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Curved Flight Path in margins around central card */}
        <path
          ref={pathRef}
          d="M -60 500 C 220 540, 180 110, 500 70 C 820 30, 880 460, 1060 380"
          fill="none"
          stroke="transparent"
        />

        {/* Faint Dashed Trail behind Plane */}
        <path
          ref={trailPathRef}
          d="M -60 500 C 220 540, 180 110, 500 70 C 820 30, 880 460, 1060 380"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="0 2000"
          className="opacity-25"
        />

        {/* Friendly Cartoon Plane SVG (~40px size) */}
        <g ref={planeGroupRef} style={{ opacity: 0 }}>
          <g transform="translate(-20, -16)">
            {/* Main Oval Fuselage - Cyan Accent (#06b6d4) */}
            <ellipse cx="20" cy="16" rx="18" ry="9" fill="#06b6d4" />

            {/* Top Light Cyan Highlight (#38bdf8) */}
            <path
              d="M 6 14 C 10 10, 26 10, 34 14 C 28 11, 12 11, 6 14 Z"
              fill="#38bdf8"
              opacity="0.9"
            />

            {/* Cartoon Tail Fin */}
            <path
              d="M 4 14 L 0 5 C 3 4, 8 6, 9 14 Z"
              fill="#0284c7"
            />

            {/* Top Swept Wing */}
            <path
              d="M 16 14 L 10 2 C 15 2, 22 7, 24 14 Z"
              fill="#38bdf8"
            />

            {/* Bottom Swept Wing */}
            <path
              d="M 16 18 L 11 28 C 16 28, 22 23, 24 18 Z"
              fill="#0284c7"
            />

            {/* Round Cockpit Window */}
            <circle cx="27" cy="13" r="3.5" fill="#e0f2fe" />
            <circle cx="28.5" cy="12" r="1.2" fill="#ffffff" />

            {/* Warm Amber Nose Spinner (#f59e0b) */}
            <path
              d="M 37 12 C 41 14, 41 18, 37 20 Z"
              fill="#f59e0b"
            />

            {/* Propeller Blade */}
            <line x1="39" y1="8" x2="39" y2="24" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
      </svg>
    </div>
  );
}
