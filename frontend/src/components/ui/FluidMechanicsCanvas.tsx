'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface FluidControlOptions {
  viscosity: number;     // diffusion rate (0.0 to 0.001)
  vorticity: number;     // swirl strength (0.0 to 1.5)
  dissipation: number;   // density decay (0.95 to 0.999)
  colorPalette: 'cyan-violet' | 'neon-fire' | 'emerald-aurora' | 'ocean-deep';
  showVelocities: boolean;
  showParticles: boolean;
  particleCount: number;
}

const DEFAULT_OPTIONS: FluidControlOptions = {
  viscosity: 0.0001,
  vorticity: 0.8,
  dissipation: 0.985,
  colorPalette: 'cyan-violet',
  showVelocities: false,
  showParticles: true,
  particleCount: 150,
};

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function FluidMechanicsCanvas({
  options = DEFAULT_OPTIONS,
  className = '',
  onStatsUpdate,
}: {
  options?: Partial<FluidControlOptions>;
  className?: string;
  onStatsUpdate?: (stats: { fps: number; maxVelocity: number; avgVorticity: number; reynoldsNum: number }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const isMouseDownRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid Grid Setup (Eulerian Grid)
    const GRID_X = 96;
    const GRID_Y = 54;
    const size = (GRID_X + 2) * (GRID_Y + 2);

    // Velocity fields
    const u = new Float32Array(size);
    const v = new Float32Array(size);
    const u_prev = new Float32Array(size);
    const v_prev = new Float32Array(size);

    // Color Density fields (R, G, B)
    const densR = new Float32Array(size);
    const densG = new Float32Array(size);
    const densB = new Float32Array(size);
    const densR_prev = new Float32Array(size);
    const densG_prev = new Float32Array(size);
    const densB_prev = new Float32Array(size);

    // Pressure & Divergence
    const p = new Float32Array(size);
    const div = new Float32Array(size);
    void p; void div;

    // Particle tracer system
    const particles: FluidParticle[] = [];
    for (let i = 0; i < opts.particleCount; i++) {
      particles.push({
        x: Math.random() * GRID_X,
        y: Math.random() * GRID_Y,
        vx: 0,
        vy: 0,
        life: Math.random() * 100,
        maxLife: 80 + Math.random() * 60,
        color: '#38bdf8',
      });
    }

    const IX = (x: number, y: number) => x + (GRID_X + 2) * y;

    // Boundary Conditions (Wall reflection or slip)
    const set_bnd = (b: number, x: Float32Array) => {
      for (let i = 1; i <= GRID_Y; i++) {
        x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(GRID_X + 1, i)] = b === 1 ? -x[IX(GRID_X, i)] : x[IX(GRID_X, i)];
      }
      for (let i = 1; i <= GRID_X; i++) {
        x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, GRID_Y + 1)] = b === 2 ? -x[IX(i, GRID_Y)] : x[IX(i, GRID_Y)];
      }
      x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
      x[IX(0, GRID_Y + 1)] = 0.5 * (x[IX(1, GRID_Y + 1)] + x[IX(0, GRID_Y)]);
      x[IX(GRID_X + 1, 0)] = 0.5 * (x[IX(GRID_X, 0)] + x[IX(GRID_X + 1, 1)]);
      x[IX(GRID_X + 1, GRID_Y + 1)] = 0.5 * (x[IX(GRID_X, GRID_Y + 1)] + x[IX(GRID_X + 1, GRID_Y)]);
    };

    // Add source (forces or density)
    const add_source = (x: Float32Array, s: Float32Array, dt: number) => {
      for (let i = 0; i < size; i++) {
        x[i] += dt * s[i];
      }
    };

    // Diffusion solver (Gauss-Seidel relaxation)
    const diffuse = (b: number, x: Float32Array, x0: Float32Array, diff: number, dt: number) => {
      const a = dt * diff * GRID_X * GRID_Y;
      for (let k = 0; k < 12; k++) {
        for (let i = 1; i <= GRID_X; i++) {
          for (let j = 1; j <= GRID_Y; j++) {
            x[IX(i, j)] = (x0[IX(i, j)] + a * (x[IX(i - 1, j)] + x[IX(i + 1, j)] + x[IX(i, j - 1)] + x[IX(i, j + 1)])) / (1 + 4 * a);
          }
        }
        set_bnd(b, x);
      }
    };

    // Advection solver (Semi-Lagrangian method)
    const advect = (b: number, d: Float32Array, d0: Float32Array, u_field: Float32Array, v_field: Float32Array, dt: number) => {
      const dt0 = dt * GRID_X;
      const dt1 = dt * GRID_Y;
      for (let i = 1; i <= GRID_X; i++) {
        for (let j = 1; j <= GRID_Y; j++) {
          let x = i - dt0 * u_field[IX(i, j)];
          let y = j - dt1 * v_field[IX(i, j)];

          if (x < 0.5) x = 0.5;
          if (x > GRID_X + 0.5) x = GRID_X + 0.5;
          const i0 = Math.floor(x);
          const i1 = i0 + 1;

          if (y < 0.5) y = 0.5;
          if (y > GRID_Y + 0.5) y = GRID_Y + 0.5;
          const j0 = Math.floor(y);
          const j1 = j0 + 1;

          const s1 = x - i0;
          const s0 = 1 - s1;
          const t1 = y - j0;
          const t0 = 1 - t1;

          d[IX(i, j)] =
            s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
            s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
      }
      set_bnd(b, d);
    };

    // Pressure & Incompressibility Projection (Hodge-Helmholtz decomposition)
    const project = (u_f: Float32Array, v_f: Float32Array, p_f: Float32Array, div_f: Float32Array) => {
      for (let i = 1; i <= GRID_X; i++) {
        for (let j = 1; j <= GRID_Y; j++) {
          div_f[IX(i, j)] = -0.5 * ((u_f[IX(i + 1, j)] - u_f[IX(i - 1, j)]) / GRID_X + (v_f[IX(i, j + 1)] - v_f[IX(i, j - 1)]) / GRID_Y);
          p_f[IX(i, j)] = 0;
        }
      }
      set_bnd(0, div_f);
      set_bnd(0, p_f);

      for (let k = 0; k < 14; k++) {
        for (let i = 1; i <= GRID_X; i++) {
          for (let j = 1; j <= GRID_Y; j++) {
            p_f[IX(i, j)] = (div_f[IX(i, j)] + p_f[IX(i - 1, j)] + p_f[IX(i + 1, j)] + p_f[IX(i, j - 1)] + p_f[IX(i, j + 1)]) / 4;
          }
        }
        set_bnd(0, p_f);
      }

      for (let i = 1; i <= GRID_X; i++) {
        for (let j = 1; j <= GRID_Y; j++) {
          u_f[IX(i, j)] -= 0.5 * GRID_X * (p_f[IX(i + 1, j)] - p_f[IX(i - 1, j)]);
          v_f[IX(i, j)] -= 0.5 * GRID_Y * (p_f[IX(i, j + 1)] - p_f[IX(i, j - 1)]);
        }
      }
      set_bnd(1, u_f);
      set_bnd(2, v_f);
    };

    // Vorticity confinement (re-injects kinetic energy into micro-vortices)
    const applyVorticity = (u_f: Float32Array, v_f: Float32Array, vorticityStrength: number, dt: number) => {
      if (vorticityStrength <= 0) return;
      const curl = new Float32Array(size);

      for (let i = 1; i <= GRID_X; i++) {
        for (let j = 1; j <= GRID_Y; j++) {
          const du_dy = (u_f[IX(i, j + 1)] - u_f[IX(i, j - 1)]) * 0.5;
          const dv_dx = (v_f[IX(i + 1, j)] - v_f[IX(i - 1, j)]) * 0.5;
          curl[IX(i, j)] = Math.abs(dv_dx - du_dy);
        }
      }

      for (let i = 2; i < GRID_X; i++) {
        for (let j = 2; j < GRID_Y; j++) {
          const dw_dx = (curl[IX(i + 1, j)] - curl[IX(i - 1, j)]) * 0.5;
          const dw_dy = (curl[IX(i, j + 1)] - curl[IX(i, j - 1)]) * 0.5;
          const len = Math.hypot(dw_dx, dw_dy) + 1e-5;

          const nx = dw_dx / len;
          const ny = dw_dy / len;
          const force = vorticityStrength * dt;

          u_f[IX(i, j)] += ny * force * curl[IX(i, j)];
          v_f[IX(i, j)] -= nx * force * curl[IX(i, j)];
        }
      }
    };

    // Fluid Step Execution
    const fluidStep = (dt: number) => {
      // Velocity step
      add_source(u, u_prev, dt);
      add_source(v, v_prev, dt);

      applyVorticity(u, v, opts.vorticity, dt);

      diffuse(1, u_prev, u, opts.viscosity, dt);
      diffuse(2, v_prev, v, opts.viscosity, dt);

      project(u_prev, v_prev, u, v);

      advect(1, u, u_prev, u_prev, v_prev, dt);
      advect(2, v, v_prev, u_prev, v_prev, dt);

      project(u, v, u_prev, v_prev);

      // Density color steps
      add_source(densR, densR_prev, dt);
      add_source(densG, densG_prev, dt);
      add_source(densB, densB_prev, dt);

      diffuse(0, densR_prev, densR, opts.viscosity, dt);
      diffuse(0, densG_prev, densG, opts.viscosity, dt);
      diffuse(0, densB_prev, densB, opts.viscosity, dt);

      advect(0, densR, densR_prev, u, v, dt);
      advect(0, densG, densG_prev, u, v, dt);
      advect(0, densB, densB_prev, u, v, dt);

      // Dissipation decay
      for (let i = 0; i < size; i++) {
        densR[i] *= opts.dissipation;
        densG[i] *= opts.dissipation;
        densB[i] *= opts.dissipation;
        u_prev[i] = 0;
        v_prev[i] = 0;
        densR_prev[i] = 0;
        densG_prev[i] = 0;
        densB_prev[i] = 0;
      }
    };

    // Color palettes generator
    const getColorForPalette = (palette: string, speed: number) => {
      if (palette === 'neon-fire') {
        return [255, Math.min(255, 60 + speed * 120), 40];
      }
      if (palette === 'emerald-aurora') {
        return [16, Math.min(255, 180 + speed * 100), 160];
      }
      if (palette === 'ocean-deep') {
        return [14, 165, 233];
      }
      // default cyan-violet
      return [6, Math.min(255, 150 + speed * 80), 246];
    };

    // Pointer Interaction Helper
    const injectFluidAtPosition = (px: number, py: number, dx: number, dy: number, isBurst = false) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (px - rect.left) / rect.width;
      const normY = (py - rect.top) / rect.height;

      const gx = Math.floor(normX * GRID_X);
      const gy = Math.floor(normY * GRID_Y);

      const radius = isBurst ? 4 : 2;
      const forceMult = isBurst ? 25 : 8;

      const speed = Math.hypot(dx, dy);
      const [r, g, b] = getColorForPalette(opts.colorPalette, speed);

      for (let rx = -radius; rx <= radius; rx++) {
        for (let ry = -radius; ry <= radius; ry++) {
          const cx = gx + rx;
          const cy = gy + ry;
          if (cx >= 1 && cx <= GRID_X && cy >= 1 && cy <= GRID_Y) {
            const idx = IX(cx, cy);
            const dist = Math.hypot(rx, ry);
            if (dist <= radius) {
              const weight = (1 - dist / (radius + 1));
              u_prev[idx] += dx * forceMult * weight;
              v_prev[idx] += dy * forceMult * weight;

              densR_prev[idx] += (r / 255) * 5 * weight;
              densG_prev[idx] += (g / 255) * 5 * weight;
              densB_prev[idx] += (b / 255) * 5 * weight;
            }
          }
        }
      }
    };

    // Event Handlers
    const handlePointerDown = (e: PointerEvent) => {
      isMouseDownRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      injectFluidAtPosition(e.clientX, e.clientY, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!lastMouseRef.current) {
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;

      injectFluidAtPosition(e.clientX, e.clientY, dx, dy, isMouseDownRef.current);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isMouseDownRef.current = false;
      lastMouseRef.current = null;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Initial ambient fluid turbulence splash
    for (let k = 0; k < 5; k++) {
      const randomX = (0.2 + Math.random() * 0.6) * window.innerWidth;
      const randomY = (0.2 + Math.random() * 0.6) * window.innerHeight;
      injectFluidAtPosition(randomX, randomY, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, true);
    }

    // Resize Handler
    let width = 0;
    let height = 0;
    const handleResize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Main Render Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsAcc = 0;
    let lastFpsReport = performance.now();

    const imgData = ctx.createImageData(GRID_X, GRID_Y);

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      frameCount++;
      fpsAcc += 1 / Math.max(dt, 0.001);

      // Run Navier-Stokes solver step
      fluidStep(0.1);

      // Render Density Buffer to Image Data
      const data = imgData.data;
      let maxVel = 0;
      let totalVorticity = 0;

      for (let j = 0; j < GRID_Y; j++) {
        for (let i = 0; i < GRID_X; i++) {
          const idx = IX(i + 1, j + 1);
          const pix = (i + j * GRID_X) * 4;

          const vel = Math.hypot(u[idx], v[idx]);
          if (vel > maxVel) maxVel = vel;
          totalVorticity += Math.abs(u[idx] - v[idx]);

          const r = Math.min(255, Math.floor(densR[idx] * 255));
          const g = Math.min(255, Math.floor(densG[idx] * 255));
          const b = Math.min(255, Math.floor(densB[idx] * 255));
          const a = Math.min(220, Math.floor((densR[idx] + densG[idx] + densB[idx]) * 150));

          data[pix] = r;
          data[pix + 1] = g;
          data[pix + 2] = b;
          data[pix + 3] = a;
        }
      }

      // Draw Fluid Density Buffer scaled up to canvas
      ctx.clearRect(0, 0, width, height);

      // Create temporary offscreen image for fluid glow
      const offscreen = document.createElement('canvas');
      offscreen.width = GRID_X;
      offscreen.height = GRID_Y;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        offCtx.putImageData(imgData, 0, 0);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(offscreen, 0, 0, width, height);
        ctx.restore();
      }

      // Render Particle Tracers along velocity vectors
      if (opts.showParticles) {
        ctx.save();
        const cellW = width / GRID_X;
        const cellH = height / GRID_Y;

        for (let pIdx = 0; pIdx < particles.length; pIdx++) {
          const pParticle = particles[pIdx];

          const gx = Math.floor(pParticle.x);
          const gy = Math.floor(pParticle.y);
          if (gx >= 1 && gx <= GRID_X && gy >= 1 && gy <= GRID_Y) {
            const idx = IX(gx, gy);
            pParticle.vx += (u[idx] * 0.4 - pParticle.vx) * 0.2;
            pParticle.vy += (v[idx] * 0.4 - pParticle.vy) * 0.2;
          }

          pParticle.x += pParticle.vx;
          pParticle.y += pParticle.vy;
          pParticle.life += 1;

          if (
            pParticle.x < 0 ||
            pParticle.x > GRID_X ||
            pParticle.y < 0 ||
            pParticle.y > GRID_Y ||
            pParticle.life >= pParticle.maxLife
          ) {
            pParticle.x = Math.random() * GRID_X;
            pParticle.y = Math.random() * GRID_Y;
            pParticle.vx = 0;
            pParticle.vy = 0;
            pParticle.life = 0;
          }

          const screenX = pParticle.x * cellW;
          const screenY = pParticle.y * cellH;
          const alpha = (1 - pParticle.life / pParticle.maxLife) * 0.8;

          ctx.beginPath();
          ctx.arc(screenX, screenY, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Velocity Vector Grid overlay if enabled
      if (opts.showVelocities) {
        ctx.save();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.lineWidth = 1;
        const step = 4;
        const cellW = width / GRID_X;
        const cellH = height / GRID_Y;

        for (let j = 2; j < GRID_Y; j += step) {
          for (let i = 2; i < GRID_X; i += step) {
            const idx = IX(i, j);
            const vx = u[idx] * 12;
            const vy = v[idx] * 12;
            if (Math.hypot(vx, vy) > 0.5) {
              const sx = i * cellW;
              const sy = j * cellH;
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sx + vx, sy + vy);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Periodically update statistics HUD
      if (onStatsUpdate && now - lastFpsReport > 250) {
        const avgFps = Math.round(fpsAcc / frameCount);
        const avgVort = Number((totalVorticity / size).toFixed(3));
        const reynolds = Math.round((maxVel * 100) / (opts.viscosity * 1000 + 0.001));

        onStatsUpdate({
          fps: avgFps || 60,
          maxVelocity: Number(maxVel.toFixed(2)),
          avgVorticity: avgVort,
          reynoldsNum: reynolds,
        });

        frameCount = 0;
        fpsAcc = 0;
        lastFpsReport = now;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [opts.viscosity, opts.vorticity, opts.dissipation, opts.colorPalette, opts.showVelocities, opts.showParticles]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
    </div>
  );
}
