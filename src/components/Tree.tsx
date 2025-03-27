// Tree configuration constants
const TREE_CONFIG = {
  // Overall scale adjustment
  scaleMultiplier: 0.5,
  // Tree crown (top part)
  crown: {
    radiusScale: 0.2,
    heightScale: 0.8,
    segments: 8,
    verticalOffset: 0.5,
    color: '#22C55E',
  },
  // Tree trunk
  trunk: {
    radiusScale: 0.05,
    heightScale: 0.2,
    verticalOffset: 0.1,
    color: '#78350F',
  },
};

import React from 'react';
import * as THREE from 'three';

interface TreeProps {
  position: THREE.Vector3;
  scale: number;
  quaternion: THREE.Quaternion;
  onClick: (e: THREE.Event) => void;
}

export function Tree({ position, scale, quaternion, onClick }: TreeProps) {
  const adjustedScale = scale * TREE_CONFIG.scaleMultiplier;
  
  return (
    <group 
      position={position}
      quaternion={quaternion}
      onClick={onClick}
    >
      {/* Tree crown */}
      <mesh castShadow position={[0, TREE_CONFIG.crown.verticalOffset * adjustedScale, 0]}>
        <coneGeometry 
          args={[
            TREE_CONFIG.crown.radiusScale * adjustedScale,
            TREE_CONFIG.crown.heightScale * adjustedScale,
            TREE_CONFIG.crown.segments
          ]} 
        />
        <meshStandardMaterial color={TREE_CONFIG.crown.color} />
      </mesh>
      {/* Tree trunk */}
      <mesh castShadow position={[0, TREE_CONFIG.trunk.verticalOffset * adjustedScale, 0]}>
        <cylinderGeometry 
          args={[
            TREE_CONFIG.trunk.radiusScale * adjustedScale,
            TREE_CONFIG.trunk.radiusScale * adjustedScale,
            TREE_CONFIG.trunk.heightScale * adjustedScale
          ]} 
        />
        <meshStandardMaterial color={TREE_CONFIG.trunk.color} />
      </mesh>
    </group>
  );
}