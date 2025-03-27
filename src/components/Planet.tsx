import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Mountain } from './Mountain';
import { Tree } from './Tree';
import { House } from './House';
import { Fire } from './Fire';

// Planet configuration constants
const PLANET_CONFIG = {
  radius: 3,
  segments: 32,
  colors: {
    water: '#4499ff',
    land: '#008800',
    deepWater: '#2244aa',
    surf: '#ffffff',
    beach: '#daa520',
  },
  materials: {
    waterMetalness: 0.9,
    waterRoughness: 0.1,
    landRoughness: 0.7,
  },
  terrain: {
    brushRadius: 48,
    brushFalloff: 96,
  },
  structures: {
    placementInterval: {
      terrain: 10,    // ms between terrain modifications
      structure: 150, // ms between structure placements
    },
  },
};

interface Structure {
  position: THREE.Vector3;
  scale: number;
  type: 'tree' | 'house' | 'mountain' | 'water' | 'land' | 'fire';
}

interface PlanetProps {
  selectedType: 'tree' | 'house' | 'mountain' | 'water' | 'land' | 'fire';
}

// Noise function for water turbulence
const noiseFunction = `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for(int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
`;

// Custom shader for smooth transitions and water ripples
const vertexShader = `
  ${noiseFunction}
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;
  
  uniform float time;
  uniform sampler2D transitionMap;
  
  void main() {
    vPosition = position;
    vUv = uv;
    
    // Calculate water displacement
    float waterFactor = 1.0 - texture2D(transitionMap, uv).r;
    vec3 newPosition = position;
    
    if (waterFactor > 0.0) {
      // Complex wave pattern
      float noise1 = fbm(vec2(position.x * 4.0 + time * 0.5, position.z * 4.0));
      float noise2 = fbm(vec2(position.z * 3.0 - time * 0.3, position.x * 3.0));
      float noise3 = fbm(vec2((position.x + position.z) * 2.0 + time * 0.4, position.y * 2.0));
      
      float displacement = 
        sin(position.x * 8.0 + time * 2.0 + noise1) * 0.003 +
        sin(position.z * 10.0 + time * 1.5 + noise2) * 0.003 +
        sin((position.x + position.z) * 6.0 + time + noise3) * 0.003;
      
      newPosition += normal * displacement * waterFactor;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    vViewPosition = -mvPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = modelMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  ${noiseFunction}
  uniform vec3 waterColor;
  uniform vec3 landColor;
  uniform float waterMetalness;
  uniform float waterRoughness;
  uniform float landRoughness;
  uniform float time;
  uniform sampler2D transitionMap;
  uniform vec3 directionalLightPosition;
  uniform mat4 directionalLightMatrix;
  uniform sampler2D directionalShadowMap;
  
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;
  
  float getShadow(vec4 worldPosition) {
    vec4 lightSpacePosition = directionalLightMatrix * worldPosition;
    vec3 projCoords = lightSpacePosition.xyz / lightSpacePosition.w;
    projCoords = projCoords * 0.5 + 0.5;
    
    float closestDepth = texture2D(directionalShadowMap, projCoords.xy).r;
    float currentDepth = projCoords.z;
    
    float bias = 0.005;
    float shadow = currentDepth - bias > closestDepth ? 0.5 : 1.0;
    
    return shadow;
  }
  
  void main() {
    vec4 transition = texture2D(transitionMap, vUv);
    float mixFactor = transition.r;
    
    // Define colors for the gradient
    vec3 deepWater = waterColor * 0.7;          // Darker water
    vec3 surfWater = vec3(0.9, 0.95, 1.0);     // White surf
    vec3 beachColor = vec3(0.75, 0.5, 0.3);    // Sandy beach
    vec3 mainLand = landColor;                  // Main land color
    
    // Create wider transition zones
    float waterStart = 0.1;    // Start of water to surf transition
    float surfStart = 0.3;     // Start of surf to beach transition
    float beachStart = 0.6;    // Start of beach to land transition
    float landStart = 0.7;     // Start of land transition
    
    vec3 color;
    float roughness;
    float metalness;
    
    // Smooth transitions between all zones
    if (mixFactor < waterStart) {
      color = deepWater;
      roughness = waterRoughness;
      metalness = waterMetalness;
    } else if (mixFactor < surfStart) {
      float t = smoothstep(waterStart, surfStart, mixFactor);
      color = mix(deepWater, surfWater, t);
      roughness = mix(waterRoughness, 0.1, t);
      metalness = mix(waterMetalness, 0.9, t);
    } else if (mixFactor < beachStart) {
      float t = smoothstep(surfStart, beachStart, mixFactor);
      color = mix(surfWater, beachColor, t);
      roughness = mix(0.1, 0.8, t);
      metalness = mix(0.9, 0.0, t);
    } else if (mixFactor < landStart) {
      float t = smoothstep(beachStart, landStart, mixFactor);
      color = mix(beachColor, mainLand, t);
      roughness = mix(0.8, landRoughness, t);
      metalness = 0.0;
    } else {
      color = mainLand;
      roughness = landRoughness;
      metalness = 0.0;
    }
    
    // Enhanced water effects
    if (mixFactor < surfStart) {
      // Dynamic noise pattern
      float noise1 = fbm(vec2(vPosition.x * 5.0 + time * 0.3, vPosition.z * 5.0));
      float noise2 = fbm(vec2(vPosition.z * 4.0 - time * 0.2, vPosition.x * 4.0));
      
      // Fresnel effect for shine
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
      
      // Combine noise and fresnel for dynamic shine
      float shine = fresnel * (0.8 + 0.2 * (noise1 + noise2));
      
      // Add specular highlights
      vec3 lightDir = normalize(directionalLightPosition);
      vec3 halfDir = normalize(lightDir + viewDir);
      float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
      specular *= (1.0 - roughness) * metalness;
      
      // Combine all effects
      color += vec3(1.0) * (shine * 0.3 + specular * 0.5);
      color += vec3(0.5, 0.7, 1.0) * fresnel * 0.2;
    }
    
    // Enhanced lighting with shadows
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(directionalLightPosition);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 ambient = color * 0.3;
    vec3 diffuse = color * diff * 0.7;
        
    vec3 finalColor = ambient + diffuse;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function Planet({ selectedType }: PlanetProps) {
  const planetRadius = PLANET_CONFIG.radius;
  const planetGroupRef = React.useRef<THREE.Group>(null);
  const planetMeshRef = React.useRef<THREE.Mesh>(null);
  const [waterFaces, setWaterFaces] = useState<number[]>([]);
  const [landFaces, setLandFaces] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const lastPlacementTime = useRef(0);
  const transitionMapRef = useRef<THREE.DataTexture | null>(null);
  const timeRef = useRef(0);
  
  // Different intervals for terrain vs structures
  const TERRAIN_INTERVAL = PLANET_CONFIG.structures.placementInterval.terrain;
  const STRUCTURE_INTERVAL = PLANET_CONFIG.structures.placementInterval.structure;
  const getPlacementInterval = () => {
    return ['water', 'land'].includes(selectedType) ? TERRAIN_INTERVAL : STRUCTURE_INTERVAL;
  };

  // Generate random scale between 50% and 80%
  const getRandomScale = () => 0.5 + Math.random() * 0.3;

  // Initialize empty structures array
  const [structures, setStructures] = useState<Structure[]>([]);

  // Create planet shader material
  const planetMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        waterColor: { value: new THREE.Color(PLANET_CONFIG.colors.water) },
        landColor: { value: new THREE.Color(PLANET_CONFIG.colors.land) },
        waterMetalness: { value: PLANET_CONFIG.materials.waterMetalness },
        waterRoughness: { value: PLANET_CONFIG.materials.waterRoughness },
        landRoughness: { value: PLANET_CONFIG.materials.landRoughness },
        transitionMap: { value: null },
        time: { value: 0 },
        directionalLightPosition: { value: new THREE.Vector3(0, 0, 0) },
        directionalLightMatrix: { value: new THREE.Matrix4() },
        directionalShadowMap: { value: null }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    // Create initial transition map
    const size = 2048;
    const data = new Float32Array(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0.0;     // R: transition value (0 = water, 1 = land)
      data[i + 1] = 0.0; // G: unused
      data[i + 2] = 0.0; // B: unused
      data[i + 3] = 1.0; // A: opacity
    }
    
    const texture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;
    
    material.uniforms.transitionMap.value = texture;
    transitionMapRef.current = texture;
    
    return material;
  }, []);

  // Function to update terrain at a specific UV coordinate
  const updateTerrainAtUV = useCallback((uv: THREE.Vector2, value: number, radius: number = PLANET_CONFIG.terrain.brushRadius, falloff: number = PLANET_CONFIG.terrain.brushFalloff) => {
    if (!transitionMapRef.current) return;

    const texture = transitionMapRef.current;
    const x = Math.floor(uv.x * texture.image.width);
    const y = Math.floor(uv.y * texture.image.height);
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          const px = (x + dx + texture.image.width) % texture.image.width;
          const py = (y + dy + texture.image.height) % texture.image.height;
          const i = (py * texture.image.width + px) * 4;
          
          // Smooth falloff
          const factor = Math.max(0, 1 - (dist - (radius - falloff)) / falloff);
          const currentValue = (texture.image.data as Float32Array)[i];
          const newValue = currentValue + (value - currentValue) * factor;
          
          (texture.image.data as Float32Array)[i] = newValue;
        }
      }
    }
    
    texture.needsUpdate = true;
  }, []);

  const placeStructure = useCallback((event: THREE.Event) => {
    if (!planetGroupRef.current || !['tree', 'house', 'mountain', 'fire'].includes(selectedType)) return;

    const currentTime = Date.now();
    if (currentTime - lastPlacementTime.current < getPlacementInterval()) {
      return;
    }
    lastPlacementTime.current = currentTime;

    const inverseMatrix = new THREE.Matrix4().copy(planetGroupRef.current.matrixWorld).invert();
    const localPoint = event.point.clone().applyMatrix4(inverseMatrix);
    const direction = localPoint.normalize();
    const position = direction.multiplyScalar(planetRadius);
    
    const newStructure: Structure = {
      position,
      scale: getRandomScale(),
      type: selectedType
    };
    
    setStructures(current => [...current, newStructure]);

    // Create smaller land patch around the structure
    const intersection = (event as any).intersections[0];
    if (intersection && intersection.uv) {
      // Reduced radius and falloff for a smaller land patch
      const structureRadius = 24;
      const structureFalloff = 12;
      updateTerrainAtUV(intersection.uv, 1.0, structureRadius, structureFalloff);
    }
  }, [selectedType, planetRadius, updateTerrainAtUV]);

  const updateTerrain = useCallback((event: THREE.Event) => {
    if (!planetMeshRef.current || !transitionMapRef.current) return;

    const currentTime = Date.now();
    if (currentTime - lastPlacementTime.current < getPlacementInterval()) {
      return;
    }
    lastPlacementTime.current = currentTime;

    const intersection = (event as any).intersections[0];
    if (intersection && typeof intersection.faceIndex === 'number') {
      const faceIndex = intersection.faceIndex;
      const uv = intersection.uv;
      
      updateTerrainAtUV(uv, selectedType === 'land' ? 1.0 : 0.0);
      
      if (selectedType === 'water') {
        setWaterFaces(prev => {
          if (prev.includes(faceIndex)) return prev;
          return [...prev, faceIndex];
        });
      } else if (selectedType === 'land') {
        setLandFaces(prev => {
          if (prev.includes(faceIndex)) return prev;
          return [...prev, faceIndex];
        });
      }
    }
  }, [selectedType, updateTerrainAtUV]);

  // Handle pointer down
  const handlePointerDown = (event: THREE.Event) => {
    event.stopPropagation();
    setIsDragging(true);
    if (selectedType === 'water' || selectedType === 'land') {
      updateTerrain(event);
    } else {
      placeStructure(event);
    }
  };

  // Handle pointer move
  const handlePointerMove = (event: THREE.Event) => {
    if (!isDragging) return;
    event.stopPropagation();
    
    if (selectedType === 'water' || selectedType === 'land') {
      updateTerrain(event);
    } else {
      placeStructure(event);
    }
  };

  // Handle pointer up
  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Calculate rotation for objects to face away from planet center
  const calculateRotation = (position: THREE.Vector3) => {
    const up = position.clone().normalize();
    const axis = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(axis, up);
    return quaternion;
  };

  // Handle structure click
  const handleStructureClick = (index: number) => {
    setStructures(current => {
      const newStructures = [...current];
      newStructures[index] = {
        ...newStructures[index],
        type: selectedType,
        scale: getRandomScale()
      };
      return newStructures;
    });
  };

  // Create planet geometry
  const planetGeometry = useMemo(() => {
    return new THREE.IcosahedronGeometry(planetRadius, PLANET_CONFIG.segments);
  }, [planetRadius]);

  // Update water animation and shadow uniforms
  useFrame((state) => {
    if (planetMaterial.uniforms) {
      timeRef.current += 0.01;
      planetMaterial.uniforms.time.value = timeRef.current;

      // Update directional light uniforms
      if (state.scene.children) {
        const directionalLight = state.scene.children.find(
          child => child instanceof THREE.DirectionalLight
        ) as THREE.DirectionalLight;

        if (directionalLight) {
          planetMaterial.uniforms.directionalLightPosition.value.copy(directionalLight.position);
          planetMaterial.uniforms.directionalLightMatrix.value.copy(directionalLight.shadow.matrix);
          planetMaterial.uniforms.directionalShadowMap.value = directionalLight.shadow.map;
        }
      }
    }
  });

  return (
    <group name="planetGroup" ref={planetGroupRef}>
      <mesh 
        ref={planetMeshRef}
        castShadow 
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        geometry={planetGeometry}
      >
        <primitive object={planetMaterial} attach="material" />
      </mesh>

      {structures.map((structure, index) => {
        const rotation = calculateRotation(structure.position);
        const handleClick = (e: THREE.Event) => {
          e.stopPropagation();
          handleStructureClick(index);
        };
        
        switch (structure.type) {
          case 'mountain':
            return (
              <Mountain
                key={`structure-${index}`}
                position={structure.position}
                scale={structure.scale}
                quaternion={rotation}
                onClick={handleClick}
              />
            );
          case 'tree':
            return (
              <Tree
                key={`structure-${index}`}
                position={structure.position}
                scale={structure.scale}
                quaternion={rotation}
                onClick={handleClick}
              />
            );
          case 'house':
            return (
              <House
                key={`structure-${index}`}
                position={structure.position}
                scale={structure.scale}
                quaternion={rotation}
                onClick={handleClick}
              />
            );
          case 'fire':
            return (
              <Fire
                key={`structure-${index}`}
                position={structure.position}
                scale={structure.scale}
                quaternion={rotation}
                onClick={handleClick}
              />
            );
          default:
            return null;
        }
      })}
    </group>
  );
}

export default Planet;