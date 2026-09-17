'use client';

/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import React, { useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  Preload,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({
  mode = 'lens',
  lensProps = {},
  barProps = {},
  cubeProps = {},
  titleText1 = "Pune Institute of Computer Technology",
  titleText2 = "Campus Connect"
}) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  return (
    <div className="w-full h-full relative overflow-hidden select-none pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper modeProps={modeProps}>
          <Typography text1={titleText1} text2={titleText2} />
          <Preload />
        </Wrapper>
      </Canvas>
    </div>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}) {
  const ref = useRef(null);
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    if (geo) {
      geo.computeBoundingBox();
      if (geo.boundingBox) {
        geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
      }
    }
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    
    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.12, delta);
    }

    if (modeProps.scale == null && ref.current) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    // Render Portal scene to FBO buffer
    gl.setRenderTarget(buffer);
    gl.setClearColor(0x05070f, 1); // Solid dark canvas background for rich refraction
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;
  const targetGeometry = nodes[geometryKey]?.geometry;

  return (
    <>
      {createPortal(children, scene)}
      
      {/* Background Plane showing FBO scene */}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>

      {/* Refraction Glass Lens mesh following pointer */}
      <mesh
        ref={ref}
        scale={scale ?? 0.28}
        rotation-x={Math.PI / 2}
        geometry={targetGeometry}
        {...props}
      >
        {!targetGeometry && (
          geometryKey === 'Cylinder'
            ? <cylinderGeometry args={[2, 2, 0.6, 64]} />
            : <boxGeometry args={[2, 2, 2]} />
        )}
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.25}
          thickness={thickness ?? 6}
          anisotropy={anisotropy ?? 0.08}
          chromaticAberration={chromaticAberration ?? 0.18}
          distortion={0.3}
          distortionScale={0.3}
          temporalDistortion={0.1}
          roughness={0}
          transmission={1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 }
  };
  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = (link) => {
    if (!link) return;
    link.startsWith('#') ? (window.location.hash = link) : (window.location.href = link);
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          depthWrite={false}
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          depthTest={false}
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Typography({ text1, text2 }) {
  const DEVICE = {
    mobile: { fontSize1: 0.18, fontSize2: 0.28 },
    tablet: { fontSize1: 0.3, fontSize2: 0.45 },
    desktop: { fontSize1: 0.38, fontSize2: 0.58 }
  };
  const getDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize1, fontSize2 } = DEVICE[device];

  return (
    <group position={[0, 0, 12]}>
      {/* Line 1: Pune Institute of Computer Technology */}
      <Text
        position={[0, 0.38, 0]}
        fontSize={fontSize1}
        letterSpacing={-0.03}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {text1}
      </Text>

      {/* Line 2: Campus Connect */}
      <Text
        position={[0, -0.38, 0]}
        fontSize={fontSize2}
        letterSpacing={-0.04}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {text2}
      </Text>
    </group>
  );
}

// Preload 3D assets
try {
  useGLTF.preload('/assets/3d/lens.glb');
  useGLTF.preload('/assets/3d/cube.glb');
  useGLTF.preload('/assets/3d/bar.glb');
} catch (e) {
  // Ignore
}
