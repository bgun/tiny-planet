import React, { useMemo } from 'react';
import * as THREE from 'three';

const CLOUD_CONFIG = {
  sphere: {
    segments: 9,
    minRadius: 0.1,
    maxRadius: 0.2,
  },
  material: {
    color: '#EEEEEE',
    transparency: 0.75,
  },
  shader: {
    softness: 0.2,
    brightness: 1.2,
    density: 2.0,
  },
};

const fragmentShader = `
  uniform vec3 color;
  uniform float softness;
  uniform float brightness;
  uniform float density;
  
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, normal)), density);
    
    // Soft edges
    float alpha = smoothstep(0.0, softness, 1.0 - fresnel);
    alpha *= brightness;
    
    gl_FragColor = vec4(color, alpha * ${CLOUD_CONFIG.material.transparency});
  }
`;

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

interface CloudProps {
  position: THREE.Vector3;
  scale?: number;
}

export function Cloud({ position, scale = 1 }: CloudProps) {
  const cloudMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(CLOUD_CONFIG.material.color) },
        softness: { value: CLOUD_CONFIG.shader.softness },
        brightness: { value: CLOUD_CONFIG.shader.brightness },
        density: { value: CLOUD_CONFIG.shader.density },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const spheres = useMemo(() => {
    const count = 5 + Math.floor(Math.random() * 4);
    const positions: THREE.Vector3[] = [];
    
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.lerp(
        CLOUD_CONFIG.sphere.minRadius,
        CLOUD_CONFIG.sphere.maxRadius,
        Math.random()
      ) * scale;
      
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.3
      ).multiplyScalar(scale);
      
      positions.push(offset);
    }
    
    return positions;
  }, [scale]);

  return (
    <group position={position}>
      {spheres.map((pos, index) => (
        <mesh key={index} position={pos}>
          <sphereGeometry args={[
            THREE.MathUtils.lerp(
              CLOUD_CONFIG.sphere.minRadius,
              CLOUD_CONFIG.sphere.maxRadius,
              Math.random()
            ) * scale,
            CLOUD_CONFIG.sphere.segments,
            CLOUD_CONFIG.sphere.segments
          ]} />
          <primitive object={cloudMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
}