import React from 'react';
import * as THREE from 'three';

// House configuration constants
const HOUSE_CONFIG = {
  // Overall scale adjustment
  scaleMultiplier: 0.5,
  // House body
  body: {
    widthScale: 0.3,
    heightScale: 0.25,
    color: '#8B4513', // Brown
  },
  // Roof
  roof: {
    heightScale: 0.15,
    overhangScale: 0.05,
    color: '#808080', // Gray
  },
  // Materials
  materials: {
    roughness: 0.8,
    metalness: 0.1,
  },
};

interface HouseProps {
  position: THREE.Vector3;
  scale: number;
  quaternion: THREE.Quaternion;
  onClick: (e: THREE.Event) => void;
}

export function House({ 
  position, 
  scale, 
  quaternion, 
  onClick,
}: HouseProps) {
  const adjustedScale = scale * HOUSE_CONFIG.scaleMultiplier;
  
  return (
    <group 
      position={position}
      quaternion={quaternion}
      onClick={onClick}
      scale={adjustedScale}
    >
      {/* House body */}
      <mesh 
        castShadow 
        position={[0, HOUSE_CONFIG.body.heightScale / 2, 0]}
      >
        <boxGeometry 
          args={[
            HOUSE_CONFIG.body.widthScale,
            HOUSE_CONFIG.body.heightScale,
            HOUSE_CONFIG.body.widthScale
          ]} 
        />
        <meshStandardMaterial 
          color={HOUSE_CONFIG.body.color}
          roughness={HOUSE_CONFIG.materials.roughness}
          metalness={HOUSE_CONFIG.materials.metalness}
        />
      </mesh>

      {/* Roof */}
      <group position={[0, (HOUSE_CONFIG.body.heightScale + HOUSE_CONFIG.roof.heightScale / 2), 0]}>
        {/* Left roof face */}
        <mesh 
          castShadow 
          position={[-0.065, -0.02, 0]}
          rotation={[0, 0, Math.PI / 6]}
        >
          <boxGeometry 
            args={[
              HOUSE_CONFIG.body.widthScale * 0.7,
              HOUSE_CONFIG.roof.heightScale * 0.1,
              HOUSE_CONFIG.body.widthScale * 1.2
            ]} 
          />
          <meshStandardMaterial
            color={HOUSE_CONFIG.roof.color}
            roughness={HOUSE_CONFIG.materials.roughness}
            metalness={HOUSE_CONFIG.materials.metalness}
          />
        </mesh>

        {/* Right roof face */}
        <mesh 
          castShadow 
          position={[0.065, -0.02, 0]}
          rotation={[0, 0, -Math.PI / 6]}
        >
          <boxGeometry 
            args={[
              HOUSE_CONFIG.body.widthScale * 0.7,
              HOUSE_CONFIG.roof.heightScale * 0.1,
              HOUSE_CONFIG.body.widthScale * 1.2
            ]} 
          />
          <meshStandardMaterial
            color={HOUSE_CONFIG.roof.color}
            roughness={HOUSE_CONFIG.materials.roughness}
            metalness={HOUSE_CONFIG.materials.metalness}
          />
        </mesh>
      </group>
    </group>
  );
}