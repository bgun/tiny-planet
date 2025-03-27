// Mountain configuration constants
const MOUNTAIN_CONFIG = {
  // Overall scale adjustment
  scaleMultiplier: 0.5,
  // Mountain shape
  geometry: {
    segments: 9,
    topRadius: 0.01,
    baseRadiusScale: 1.2,
    heightScale: 1.5,
  },
  // Mountain colors
  colors: {
    bottom: '#008800',    // Match planet green
    middle: '#666666',    // Muted gray
    top: '#EEEEEE',      // Light gray peaks
  },
  // Material properties
  materials: {
    roughness: 0.8,
    metalness: 0.1,
  },
};

import React from 'react';
import * as THREE from 'three';

interface MountainProps {
  position: THREE.Vector3;
  scale: number;
  quaternion: THREE.Quaternion;
  onClick: (e: THREE.Event) => void;
}

export function Mountain({ position, scale, quaternion, onClick }: MountainProps) {
  const adjustedScale = scale * MOUNTAIN_CONFIG.scaleMultiplier;
  
  return (
    <group 
      position={position}
      quaternion={quaternion}
      onClick={onClick}
      scale={adjustedScale}
    >
      {/* Middle of the mountain */}
      <mesh 
        castShadow 
        receiveShadow
        position={[0, MOUNTAIN_CONFIG.geometry.heightScale / 3, 0]}
      >
        <cylinderGeometry 
          args={[
            MOUNTAIN_CONFIG.geometry.baseRadiusScale * 0.4,
            MOUNTAIN_CONFIG.geometry.baseRadiusScale,
            MOUNTAIN_CONFIG.geometry.heightScale * 0.4,
            MOUNTAIN_CONFIG.geometry.segments
          ]} 
        />
        <meshStandardMaterial 
          color={MOUNTAIN_CONFIG.colors.middle}
          roughness={MOUNTAIN_CONFIG.materials.roughness}
          metalness={MOUNTAIN_CONFIG.materials.metalness}
        />
      </mesh>

      {/* Snow-capped peak */}
      <mesh
        castShadow
        receiveShadow
        position={[0, MOUNTAIN_CONFIG.geometry.heightScale * 0.7, 0]}
      >
        <cylinderGeometry
          args={[
            MOUNTAIN_CONFIG.geometry.topRadius,
            MOUNTAIN_CONFIG.geometry.baseRadiusScale * 0.4,
            MOUNTAIN_CONFIG.geometry.heightScale * 0.3,
            MOUNTAIN_CONFIG.geometry.segments
          ]}
        />
        <meshStandardMaterial
          color={MOUNTAIN_CONFIG.colors.top}
          roughness={MOUNTAIN_CONFIG.materials.roughness}
          metalness={MOUNTAIN_CONFIG.materials.metalness}
        />
      </mesh>

      {/* Mountain base - positioned slightly below surface (0.1) to create seamless blend with planet */}
      <mesh
        position={[0, MOUNTAIN_CONFIG.geometry.heightScale * 0, 0]}
      >
        <cylinderGeometry
          args={[
            MOUNTAIN_CONFIG.geometry.baseRadiusScale,
            MOUNTAIN_CONFIG.geometry.baseRadiusScale * 1.3,
            MOUNTAIN_CONFIG.geometry.heightScale * 0.3,
            MOUNTAIN_CONFIG.geometry.segments
          ]}
        />
        <meshStandardMaterial
          color={MOUNTAIN_CONFIG.colors.bottom}
          roughness={MOUNTAIN_CONFIG.materials.roughness}
          metalness={MOUNTAIN_CONFIG.materials.metalness}
        />
      </mesh>
    </group>
  );
}