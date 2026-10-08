'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as random from 'maath/random';
import * as THREE from 'three';

// ============================================================================
// MATHEMATICAL SPHERE & CAMERA DIMENSIONS
// ============================================================================
// Inner core radius = 1.0
// Outer shell scale = 1.15 (Inner * 1.15)
// Group scale S = 1.8
// Outer shell radius R = 1.15 * 1.8 = 2.07 units
// Camera FOV = 50°
// Camera Distance D = 7.2 units
// Frustum Height at D=7.2: H = 7.2 * tan(25°) = 3.357 units
// Padding margin: (3.357 - 2.07) / 3.357 = 38.3% margin (No clipping ever)
// ============================================================================

function RotatingIcosahedron() {
  const innerRef = useRef<THREE.Mesh>(null!);
  const heroWireframeRef = useRef<THREE.Mesh>(null!);
  const outerShellRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    // Smooth 30% slower, elegant rotation
    if (innerRef.current) {
      innerRef.current.rotation.x += delta * 0.09;
      innerRef.current.rotation.y += delta * 0.13;
    }
    if (heroWireframeRef.current) {
      heroWireframeRef.current.rotation.x += delta * 0.09;
      heroWireframeRef.current.rotation.y += delta * 0.13;
    }
    if (outerShellRef.current) {
      outerShellRef.current.rotation.x -= delta * 0.07;
      outerShellRef.current.rotation.y -= delta * 0.11;
    }

    // Small, controlled tilt reaction (capped at ~0.12 rad)
    if (groupRef.current) {
      const targetTiltY = state.pointer.x * 0.12;
      const targetTiltX = -state.pointer.y * 0.12;
      groupRef.current.rotation.y += (targetTiltY - groupRef.current.rotation.y) * 0.04;
      groupRef.current.rotation.x += (targetTiltX - groupRef.current.rotation.x) * 0.04;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.35}>
      <group ref={groupRef} scale={2.2}>
        {/* 1. Semi-transparent solid inner core for solid presence */}
        <mesh ref={innerRef} frustumCulled={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#06b6d4"
            transparent={true}
            opacity={0.09}
            roughness={0.2}
            metalness={0.7}
            wireframe={false}
            depthWrite={false}
          />
        </mesh>

        {/* 2. Hero Wireframe Edges — Crisp Electric Cyan */}
        <mesh ref={heroWireframeRef} scale={1.02} frustumCulled={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#22d3ee"
            wireframe={true}
            transparent={true}
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>

        {/* 3. Outer Glowing Shell — Muted Violet (Scale 1.15 for clear separation) */}
        <mesh ref={outerShellRef} scale={1.15} frustumCulled={false}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color="#8b5cf6"
            wireframe={true}
            transparent={true}
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

function HeroParticleDust() {
  const pointsRef = useRef<THREE.Points>(null!);
  const sphere = React.useMemo(() => {
    const data = new Float32Array(120 * 3);
    random.inSphere(data, { radius: 2.8 });
    return data;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta * 0.025;
      pointsRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sphere, 3]} />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color="#06b6d4"
          size={0.028}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.45}
        />
      </points>
    </group>
  );
}

export default function HeroThreeScene() {
  return (
    <div className="relative w-full aspect-square max-w-[620px] min-w-[280px] mx-auto flex items-center justify-center pointer-events-none">
      {/* Soft Radial Cyan Halo behind the 3D Sphere */}
      <div className="absolute inset-4 rounded-full bg-cyan-500/12 blur-[80px] pointer-events-none z-0" />

      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 50, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        className="relative z-10 w-full h-full block"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.6} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
        <RotatingIcosahedron />
        <HeroParticleDust />
      </Canvas>
    </div>
  );
}
