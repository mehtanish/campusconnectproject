'use client';

import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlowCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  glowColor?: string;
  interactive?: boolean;
}

export const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  (
    {
      children,
      className,
      glowColor = 'rgba(6, 182, 212, 0.18)',
      interactive = true,
      ...props
    },
    ref
  ) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
      if (!interactive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        className={cn(
          'relative isolate overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-xl transition-all duration-300 h-full w-full flex flex-col',
          isHovered && 'border-cyan-500/40 shadow-2xl shadow-cyan-500/10',
          className
        )}
        {...props}
      >
        {/* Spotlight cursor glow layer - absolute inset-0 rounded-[inherit] */}
        {interactive && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-0"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 70%)`,
            }}
          />
        )}

        {/* Ambient border gradient accent overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 z-0" />

        {/* Content wrapper: relative z-10 h-full flex flex-col flex-1 */}
        <div className="relative z-10 h-full w-full flex flex-col flex-1 bg-transparent">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlowCard.displayName = 'GlowCard';

