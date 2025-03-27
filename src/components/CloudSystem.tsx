import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Cloud } from './Cloud';

const CLOUD_SYSTEM_CONFIG = {
  radius: 3.5, // Slightly larger than planet radius
  cloudCount: 120,
  rotationSpeed: 0.0001,
  heightVariation: 0.2,
};

export function CloudSystem() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate initial cloud positions
  const cloudData = React.useMemo(() => {
    const data = [];
    for (let i = 0; i < CLOUD_SYSTEM_CONFIG.cloudCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      
      const x = CLOUD_SYSTEM_CONFIG.radius * Math.sin(theta) * Math.cos(phi);
      const y = CLOUD_SYSTEM_CONFIG.radius * Math.sin(theta) * Math.sin(phi);
      const z = CLOUD_SYSTEM_CONFIG.radius * Math.cos(theta);
      
      const position = new THREE.Vector3(x, y, z);
      const scale = 0.8 + Math.random() * 0.4;
      
      data.push({ position, scale });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += CLOUD_SYSTEM_CONFIG.rotationSpeed * delta * 1000;
    }
  });

  return (
    <group ref={groupRef}>
      {cloudData.map((cloud, index) => (
        <Cloud
          key={index}
          position={cloud.position}
          scale={cloud.scale}
        />
      ))}
    </group>
  );
}