'use client';

import React from 'react';
import { TextAnimationCollection } from './TextAnimationCollection';
import './threeui.css';

export function Scene() {
  return (
    <div className="shader-frame relative w-full h-[380px] sm:h-[450px] overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-500/10">
      <TextAnimationCollection
        variant="threeui-intro"
        mode="dark"
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}

export default Scene;
