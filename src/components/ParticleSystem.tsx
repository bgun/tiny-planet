import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  count?: number;
  rotationSpeed?: number;
  color?: string;
  radius?: number;
  size?: number;
  spread?: number;
}

const PARTICLE_DEFAULTS = {
  count: 1000,
  rotationSpeed: 0.0002,
  color: '#ffffff',
  radius: 3.8,
  size: 0.02,
  spread: 0.5,
};

export function ParticleSystem({
  count = PARTICLE_DEFAULTS.count,
  rotationSpeed = PARTICLE_DEFAULTS.rotationSpeed,
  color = PARTICLE_DEFAULTS.color,
  radius = PARTICLE_DEFAULTS.radius,
  size = PARTICLE_DEFAULTS.size,
  spread = PARTICLE_DEFAULTS.spread,
}: ParticleSystemProps) {
  const points = useRef<THREE.Points>(null);

  // Generate random positions for particles
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Generate random spherical coordinates
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      // Convert to Cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      // Add random spread
      positions[i3] = x + (Math.random() - 0.5) * spread;
      positions[i3 + 1] = y + (Math.random() - 0.5) * spread;
      positions[i3 + 2] = z + (Math.random() - 0.5) * spread;
    }
    
    return positions;
  }, [count, radius, spread]);

  // Create geometry with random positions
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  // Create material with custom shader
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      color: new THREE.Color(color),
      blending: THREE.AdditiveBlending,
    });
  }, [color, size]);

  // Rotate particles
  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y -= rotationSpeed * delta * 1000;
    }
  });

  return (
    <points ref={points} geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  );
}