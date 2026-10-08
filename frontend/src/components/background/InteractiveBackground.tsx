'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const TUNABLES = {
  PARTICLE_COUNT_DESKTOP: 48,
  PARTICLE_COUNT_MOBILE: 24,
  LINK_DISTANCE: 120,
  MAX_LINKS_PER_PARTICLE: 2,
  LINE_OPACITY: 0.12,
  CURSOR_RADIUS: 140,
  MAX_CURSOR_LINES: 4,
  ATTRACTION_STRENGTH: 0.02,
  MAX_DISPLACEMENT: 25,
  SHOCKWAVE_STRENGTH: 6,
  TEXT_FADE_STRENGTH: 0.85,
  SPHERE_GLOW: 0.12,
  COLORS: {
    cyan: '6, 182, 212',
    violet: '139, 92, 246',
    slate: '148, 163, 184',
  },
};

interface Particle {
  x: number;
  y: number;
  origX: number;
  origY: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  color: string;
  alpha: number;
  depthLayer: number;
  isHeroNode: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const mouseX = useMotionValue(-500);
  const mouseY = useMotionValue(-500);
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    let virtualAngle = 0;
    const shockwaves: Shockwave[] = [];

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? TUNABLES.PARTICLE_COUNT_MOBILE : TUNABLES.PARTICLE_COUNT_DESKTOP;

    const particles: Particle[] = [];
    const colorKeys = [TUNABLES.COLORS.cyan, TUNABLES.COLORS.violet, TUNABLES.COLORS.slate];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const layer = Math.random() < 0.4 ? 0 : Math.random() < 0.85 ? 1 : 2;
      const speedMult = layer === 0 ? 0.15 : layer === 1 ? 0.25 : 0.4;
      const baseSpeed = (0.2 + Math.random() * 0.5) * speedMult;

      const isHero = layer === 2 && Math.random() < 0.35;
      const radius = layer === 0 ? 1.0 : layer === 1 ? 1.6 : isHero ? 2.4 : 1.8;
      const alpha = layer === 0 ? 0.18 : layer === 1 ? 0.35 : 0.6;

      let posX = Math.random() * width;
      if (Math.random() < 0.45) {
        posX = width * 0.4 + Math.random() * (width * 0.6);
      }

      const initialY = Math.random() * height;

      particles.push({
        x: posX,
        y: initialY,
        origX: posX,
        origY: initialY,
        vx: Math.cos(angle) * baseSpeed,
        vy: Math.sin(angle) * baseSpeed,
        baseVx: Math.cos(angle) * baseSpeed,
        baseVy: Math.sin(angle) * baseSpeed,
        radius,
        color: colorKeys[Math.floor(Math.random() * colorKeys.length)],
        alpha,
        depthLayer: layer,
        isHeroNode: isHero,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();

    const handlePointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;

      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, select, textarea, [role="button"]')) {
        setIsHoveringInteractive(true);
      } else {
        setIsHoveringInteractive(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      if (!prefersReducedMotion) {
        shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: TUNABLES.CURSOR_RADIUS * 1.2,
          alpha: 0.5,
        });
      }
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerleave', handlePointerLeave);

    let isTabVisible = document.visibilityState === 'visible';
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isTabVisible) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (pointer.active) {
        pointer.x += (pointer.targetX - pointer.x) * 0.12;
        pointer.y += (pointer.targetY - pointer.y) * 0.12;
      } else {
        virtualAngle += dt * 0.25;
        pointer.x = width * 0.7 + Math.cos(virtualAngle) * 120;
        pointer.y = height * 0.4 + Math.sin(virtualAngle * 0.8) * 80;
      }

      ctx.clearRect(0, 0, width, height);

      const gridStep = 40;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.035)';
      for (let gx = 0; gx < width; gx += gridStep) {
        for (let gy = 0; gy < height; gy += gridStep) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += (sw.maxRadius - sw.radius) * 0.08;
        sw.alpha -= dt * 0.8;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius - 5) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${TUNABLES.COLORS.cyan}, ${sw.alpha * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - sw.x;
          const dy = p.y - sw.y;
          const dist = Math.hypot(dx, dy);
          if (Math.abs(dist - sw.radius) < 30 && dist > 0) {
            const force = ((30 - Math.abs(dist - sw.radius)) / 30) * TUNABLES.SHOCKWAVE_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
      }

      const linkCounts: number[] = new Array(particles.length).fill(0);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < TUNABLES.CURSOR_RADIUS && dist > 0) {
            const factor = (1 - dist / TUNABLES.CURSOR_RADIUS) * TUNABLES.ATTRACTION_STRENGTH;
            const dispX = Math.min(Math.max(dx * factor, -TUNABLES.MAX_DISPLACEMENT), TUNABLES.MAX_DISPLACEMENT);
            const dispY = Math.min(Math.max(dy * factor, -TUNABLES.MAX_DISPLACEMENT), TUNABLES.MAX_DISPLACEMENT);
            p.vx += dispX * dt;
            p.vy += dispY * dt;
          }

          p.vx += (p.baseVx - p.vx) * 0.02;
          p.vy += (p.baseVy - p.vy) * 0.02;

          p.x += p.vx;
          p.y += p.vy;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const parallaxFactor = p.depthLayer === 0 ? 0.008 : p.depthLayer === 1 ? 0.018 : 0.03;
        const renderX = p.x - (pointer.x - width / 2) * parallaxFactor;
        const renderY = p.y - (pointer.y - height / 2) * parallaxFactor;

        let effectiveAlpha = p.alpha;
        if (renderX < width * 0.55) {
          const textFade = 1 - Math.min((width * 0.55 - renderX) / (width * 0.55), 1) * TUNABLES.TEXT_FADE_STRENGTH;
          effectiveAlpha *= textFade;
        }

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${effectiveAlpha})`;

        if (p.isHeroNode) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = `rgba(${p.color}, 0.5)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        if (linkCounts[i] >= TUNABLES.MAX_LINKS_PER_PARTICLE) continue;

        const p1 = particles[i];
        const p1X = p1.x - (pointer.x - width / 2) * (p1.depthLayer === 0 ? 0.008 : 0.018);
        const p1Y = p1.y - (pointer.y - height / 2) * (p1.depthLayer === 0 ? 0.008 : 0.018);

        for (let j = i + 1; j < particles.length; j++) {
          if (linkCounts[j] >= TUNABLES.MAX_LINKS_PER_PARTICLE) continue;

          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < TUNABLES.LINK_DISTANCE) {
            const p2X = p2.x - (pointer.x - width / 2) * (p2.depthLayer === 0 ? 0.008 : 0.018);
            const p2Y = p2.y - (pointer.y - height / 2) * (p2.depthLayer === 0 ? 0.008 : 0.018);

            let lineAlpha = (1 - dist / TUNABLES.LINK_DISTANCE) * TUNABLES.LINE_OPACITY;

            if (p1X < width * 0.55) {
              lineAlpha *= 0.3;
            }

            ctx.beginPath();
            ctx.moveTo(p1X, p1Y);
            ctx.lineTo(p2X, p2Y);
            ctx.strokeStyle = `rgba(${p1.color}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            linkCounts[i]++;
            linkCounts[j]++;
          }
        }
      }

      if (pointer.active && !prefersReducedMotion) {
        const nearby: { particle: Particle; dist: number; index: number }[] = [];

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < TUNABLES.CURSOR_RADIUS) {
            nearby.push({ particle: p, dist, index: i });
          }
        }

        nearby.sort((a, b) => a.dist - b.dist);

        const linesToDraw = Math.min(nearby.length, TUNABLES.MAX_CURSOR_LINES);
        for (let k = 0; k < linesToDraw; k++) {
          const { particle, dist } = nearby[k];
          const pX = particle.x - (pointer.x - width / 2) * 0.02;
          const pY = particle.y - (pointer.y - height / 2) * 0.02;
          const lineAlpha = (1 - dist / TUNABLES.CURSOR_RADIUS) * 0.22;

          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(pX, pY);
          ctx.strokeStyle = `rgba(${TUNABLES.COLORS.cyan}, ${lineAlpha})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0 }}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: smoothX,
          y: smoothY,
          background: `radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.03) 50%, transparent 70%)`,
        }}
      />

      <motion.div
        className="absolute w-7 h-7 rounded-full border border-cyan-400/30 pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          scale: isHoveringInteractive ? 1.5 : 1,
          borderColor: isHoveringInteractive ? 'rgba(139, 92, 246, 0.6)' : 'rgba(6, 182, 212, 0.3)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    </motion.div>
  );
}
