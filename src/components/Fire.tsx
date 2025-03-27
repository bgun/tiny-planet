// Fire configuration constants
const FIRE_CONFIG = {
  // Overall scale adjustment
  scaleMultiplier: 0.3,
  // Flame
  flame: {
    radiusScale: 0.15,
    heightScale: 0.4,
    segments: 8,
    verticalOffset: 0.2,
    color: '#AA4400',
    emissive: '#ff5500',
    emissiveIntensity: 2,
    opacity: 0.8,
  },
  // Light
  light: {
    color: '#ff3300',
    intensity: 0.5,
    distance: 2,
    decay: 2,
  },
};

import React from 'react';
import * as THREE from 'three';

interface FireProps {
  position: THREE.Vector3;
  scale: number;
  quaternion: THREE.Quaternion;
  onClick: (e: THREE.Event) => void;
}

export function Fire({ position, scale, quaternion, onClick }: FireProps) {
  const adjustedScale = scale * FIRE_CONFIG.scaleMultiplier;
  
  return (
    <group 
      position={position}
      quaternion={quaternion}
      onClick={onClick}
    >
      <mesh castShadow position={[0, FIRE_CONFIG.flame.verticalOffset * adjustedScale, 0]}>
        <coneGeometry 
          args={[
            FIRE_CONFIG.flame.radiusScale * adjustedScale,
            FIRE_CONFIG.flame.heightScale * adjustedScale,
            FIRE_CONFIG.flame.segments
          ]} 
        />
        <meshStandardMaterial 
          color={FIRE_CONFIG.flame.color}
          emissive={FIRE_CONFIG.flame.emissive}
          emissiveIntensity={FIRE_CONFIG.flame.emissiveIntensity}
          transparent
          opacity={FIRE_CONFIG.flame.opacity}
        />
      </mesh>
      <pointLight
        position={[0, FIRE_CONFIG.flame.verticalOffset * adjustedScale, 0]}
        color={FIRE_CONFIG.light.color}
        intensity={FIRE_CONFIG.light.intensity}
        distance={FIRE_CONFIG.light.distance}
        decay={FIRE_CONFIG.light.decay}
      />
    </group>
  );
}