'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  Zap,
  Activity,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  Flame,
  Droplets,
  Wind
} from 'lucide-react';
import FluidMechanicsCanvas, { FluidControlOptions } from './FluidMechanicsCanvas';
import { Button } from './Button';

export function FluidMechanicsSection() {
  const [options, setOptions] = useState<FluidControlOptions>({
    viscosity: 0.0001,
    vorticity: 0.8,
    dissipation: 0.985,
    colorPalette: 'cyan-violet',
    showVelocities: true,
    showParticles: true,
    particleCount: 150,
  });

  const [stats, setStats] = useState({
    fps: 60,
    maxVelocity: 0,
    avgVorticity: 0,
    reynoldsNum: 0,
  });

  const applyPreset = (preset: 'laminar' | 'turbulent' | 'gel' | 'chaos') => {
    if (preset === 'laminar') {
      setOptions({
        ...options,
        viscosity: 0.00005,
        vorticity: 0.1,
        dissipation: 0.99,
        colorPalette: 'ocean-deep',
        showVelocities: true,
      });
    } else if (preset === 'turbulent') {
      setOptions({
        ...options,
        viscosity: 0.00001,
        vorticity: 1.4,
        dissipation: 0.98,
        colorPalette: 'neon-fire',
        showVelocities: false,
      });
    } else if (preset === 'gel') {
      setOptions({
        ...options,
        viscosity: 0.0008,
        vorticity: 0.4,
        dissipation: 0.97,
        colorPalette: 'emerald-aurora',
        showVelocities: true,
      });
    } else if (preset === 'chaos') {
      setOptions({
        ...options,
        viscosity: 0.0001,
        vorticity: 1.0,
        dissipation: 0.988,
        colorPalette: 'cyan-violet',
        showVelocities: false,
      });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-20">
      {/* Title & Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
          Interactive Hydrodynamics Physics Engine
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight"
        >
          Navier-Stokes <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">Fluid Mechanics</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-3 max-w-2xl text-sm sm:text-base text-slate-400"
        >
          Drag your cursor across the fluid field below to inject momentum, trigger turbulent vortices, and observe real-time Eulerian fluid dynamics (incompressible flow field).
        </motion.p>
      </div>

      {/* Main Container Card */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side: Interactive Canvas Area */}
        <div className="relative flex-1 h-[450px] sm:h-[500px] lg:h-[550px] bg-slate-950 overflow-hidden">
          <FluidMechanicsCanvas options={options} onStatsUpdate={setStats} />

          {/* Canvas Instructions Overlay Badge */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20 text-xs text-cyan-300 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>Click & Drag anywhere to create fluid vortices</span>
          </div>

          {/* Telemetry HUD Cards */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pointer-events-none">
            <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/20 shadow-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> Frame Rate
              </span>
              <p className="text-sm font-bold text-cyan-300 mt-0.5">{stats.fps} <span className="text-[10px] text-slate-400 font-normal">FPS</span></p>
            </div>

            <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/20 shadow-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-violet-400" /> Max Velocity
              </span>
              <p className="text-sm font-bold text-violet-300 mt-0.5">{stats.maxVelocity} <span className="text-[10px] text-slate-400 font-normal">u/s</span></p>
            </div>

            <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/20 shadow-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-emerald-400" /> Vorticity (ω)
              </span>
              <p className="text-sm font-bold text-emerald-300 mt-0.5">{stats.avgVorticity}</p>
            </div>

            <div className="bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/20 shadow-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Reynolds (Re)
              </span>
              <p className="text-sm font-bold text-amber-300 mt-0.5">{stats.reynoldsNum}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Fluid Controls Panel */}
        <div className="w-full lg:w-80 p-5 sm:p-6 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-cyan-500/20 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" /> Fluid Physics Parameters
            </h3>

            {/* Presets */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Flow Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset('laminar')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-200 transition text-left flex items-center gap-1.5"
                >
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> Laminar
                </button>
                <button
                  onClick={() => applyPreset('turbulent')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-200 transition text-left flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Turbulent
                </button>
                <button
                  onClick={() => applyPreset('gel')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-200 transition text-left flex items-center gap-1.5"
                >
                  <Waves className="w-3.5 h-3.5 text-emerald-400" /> Dense Gel
                </button>
                <button
                  onClick={() => applyPreset('chaos')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-200 transition text-left flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Hydro-Chaos
                </button>
              </div>
            </div>

            {/* Viscosity Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1 font-medium">
                <span>Viscosity (&mu;)</span>
                <span className="text-cyan-400 font-mono">{(options.viscosity * 10000).toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.00001"
                max="0.0008"
                step="0.00002"
                value={options.viscosity}
                onChange={(e) => setOptions({ ...options, viscosity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Vorticity Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1 font-medium">
                <span>Vorticity Confinement (&omega;)</span>
                <span className="text-violet-400 font-mono">{options.vorticity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.8"
                step="0.1"
                value={options.vorticity}
                onChange={(e) => setOptions({ ...options, vorticity: parseFloat(e.target.value) })}
                className="w-full accent-violet-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Color Palette Picker */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Dye Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['cyan-violet', 'neon-fire', 'emerald-aurora', 'ocean-deep'] as const).map((palette) => (
                  <button
                    key={palette}
                    onClick={() => setOptions({ ...options, colorPalette: palette })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition capitalize ${
                      options.colorPalette === palette
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {palette.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> Velocity Grid Vectors
                </span>
                <input
                  type="checkbox"
                  checked={options.showVelocities}
                  onChange={(e) => setOptions({ ...options, showVelocities: e.target.checked })}
                  className="accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Fluid Particles
                </span>
                <input
                  type="checkbox"
                  checked={options.showParticles}
                  onChange={(e) => setOptions({ ...options, showParticles: e.target.checked })}
                  className="accent-violet-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Quick info note */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed font-mono">
            &bull; Solves incompressible Navier-Stokes momentum equations: &part;u/&part;t + (u &bull; &nabla;)u = -&nabla;p/&rho; + &nu;&nabla;&sup2;u + f
          </div>
        </div>
      </div>
    </section>
  );
}
