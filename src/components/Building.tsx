// Building configuration constants
const BUILDING_CONFIG = {
  // Overall scale adjustment
  scaleMultiplier: 0.5,
  // Building geometry
  geometry: {
    widthScale: 0.3,
    minHeight: 0.5,
    maxHeight: 1.0,
  },
  // Materials
  materials: {
    roughness: 0.8,
    metalness: 0.2,
    emissive: '#ffaa00',
    emissiveIntensity: 0.5,
    roofColor: '#1a1a1a',
  },
  // Texture
  texture: {
    size: 256,
    squareSize: 24,
    squaresPerRow: 4,
    windowProbability: 0.3,
    baseColor: '#556677',
    windowColor: 'white',
    emissiveColor: '#ffaa00',
  },
};

import React from 'react';
import * as THREE from 'three';

interface BuildingProps {
  position: THREE.Vector3;
  scale: number;
  height: number;
  quaternion: THREE.Quaternion;
  onClick: (e: THREE.Event) => void;
  buildingTexture: THREE.Texture;
  buildingEmissiveTexture: THREE.Texture;
}

export function Building({ 
  position, 
  scale, 
  height, 
  quaternion, 
  onClick,
  buildingTexture,
  buildingEmissiveTexture 
}: BuildingProps) {
  const adjustedScale = scale * BUILDING_CONFIG.scaleMultiplier;
  
  return (
    <group 
      position={position}
      quaternion={quaternion}
      onClick={onClick}
    >
      <mesh 
        castShadow 
        position={[0, (height * adjustedScale)/2, 0]}
      >
        <boxGeometry 
          args={[
            BUILDING_CONFIG.geometry.widthScale * adjustedScale,
            height * adjustedScale,
            BUILDING_CONFIG.geometry.widthScale * adjustedScale
          ]} 
        />
        <meshStandardMaterial 
          map={buildingTexture}
          emissiveMap={buildingEmissiveTexture}
          emissive={BUILDING_CONFIG.materials.emissive}
          emissiveIntensity={BUILDING_CONFIG.materials.emissiveIntensity}
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-0" // right
        />
        <meshStandardMaterial 
          map={buildingTexture}
          emissiveMap={buildingEmissiveTexture}
          emissive={BUILDING_CONFIG.materials.emissive}
          emissiveIntensity={BUILDING_CONFIG.materials.emissiveIntensity}
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-1" // left
        />
        <meshStandardMaterial 
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-2" // top
          color={BUILDING_CONFIG.materials.roofColor}
        />
        <meshStandardMaterial 
          map={buildingTexture}
          emissiveMap={buildingEmissiveTexture}
          emissive={BUILDING_CONFIG.materials.emissive}
          emissiveIntensity={BUILDING_CONFIG.materials.emissiveIntensity}
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-3" // bottom
        />
        <meshStandardMaterial 
          map={buildingTexture}
          emissiveMap={buildingEmissiveTexture}
          emissive={BUILDING_CONFIG.materials.emissive}
          emissiveIntensity={BUILDING_CONFIG.materials.emissiveIntensity}
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-4" // front
        />
        <meshStandardMaterial 
          map={buildingTexture}
          emissiveMap={buildingEmissiveTexture}
          emissive={BUILDING_CONFIG.materials.emissive}
          emissiveIntensity={BUILDING_CONFIG.materials.emissiveIntensity}
          roughness={BUILDING_CONFIG.materials.roughness}
          metalness={BUILDING_CONFIG.materials.metalness}
          attach="material-5" // back
        />
      </mesh>
    </group>
  );
}