import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, N8AO, Vignette, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Planet from './components/Planet';
import { CloudSystem } from './components/CloudSystem';
import { ParticleSystem } from './components/ParticleSystem';
import * as THREE from 'three';

type StructureType = 'mountain' | 'tree' | 'water' | 'house' | 'land' | 'fire';

const STRUCTURE_EMOJIS: Record<StructureType, string> = {
  mountain: '🏔️',
  tree: '🌲',
  water: '🌊',
  house: '🏠',
  land: '🌿',
  fire: '🔥',
};

// Global rendering configuration
const RENDER_CONFIG = {
  ambientLight: {
    intensity: 1,
    color: '#445599',
  },
  directionalLight: {
    offset: new THREE.Vector3(0, 0, 0), // Relative to camera
    intensity: 3,
    shadowMapSize: [4096, 4096],
    bias: -0.0001,
    normalBias: 0.001,
    shadowRadius: 2,
    shadowCameraSize: 10,
  },
  postProcessing: {
    bloom: {
      intensity: 0.5,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.9,
    },
    ambientOcclusion: {
      intensity: 2,
      aoRadius: 40,
      distanceFalloff: 1,
      screenSpaceRadius: true,
      blendFunction: BlendFunction.MULTIPLY,
    },
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 5, 5],
    minDistance: 4,
    maxDistance: 10,
    autoRotateSpeed: 0.5,
  },
};

// Component to update directional light position
function DirectionalLightController() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (lightRef.current) {
      // Get camera's position and add the configured offset
      const lightPosition = camera.position.clone().add(RENDER_CONFIG.directionalLight.offset);
      lightRef.current.position.copy(lightPosition);
      
      // Update target to always point at the center
      lightRef.current.target.position.set(0, 0, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      intensity={RENDER_CONFIG.directionalLight.intensity}
      castShadow
      shadow-mapSize={RENDER_CONFIG.directionalLight.shadowMapSize}
      shadow-bias={RENDER_CONFIG.directionalLight.bias}
      shadow-normalBias={RENDER_CONFIG.directionalLight.normalBias}
      shadow-radius={RENDER_CONFIG.directionalLight.shadowRadius}
      shadow-camera-left={-RENDER_CONFIG.directionalLight.shadowCameraSize}
      shadow-camera-right={RENDER_CONFIG.directionalLight.shadowCameraSize}
      shadow-camera-top={RENDER_CONFIG.directionalLight.shadowCameraSize}
      shadow-camera-bottom={-RENDER_CONFIG.directionalLight.shadowCameraSize}
    >
      <object3D />
    </directionalLight>
  );
}

function App() {
  const [selectedType, setSelectedType] = useState<StructureType>('land');
  const [showOverlay, setShowOverlay] = useState(true);
  const orbitControlsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [orbitDomElement, setOrbitDomElement] = useState<HTMLElement | null>(null);
  const autoRotateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (orbitControlsRef.current) {
      setOrbitDomElement(orbitControlsRef.current);
    }
  }, []);

  const startAutoRotation = () => {
    if (controlsRef.current && !isInteractingRef.current) {
      controlsRef.current.autoRotate = true;
    }
  };

  const stopAutoRotation = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  };

  const resetAutoRotationTimer = () => {
    if (autoRotateTimeoutRef.current) {
      clearTimeout(autoRotateTimeoutRef.current);
    }

    autoRotateTimeoutRef.current = setTimeout(startAutoRotation, 5000);
  };

  const handleInteractionStart = () => {
    isInteractingRef.current = true;
    stopAutoRotation();
  };

  const handleInteractionEnd = () => {
    isInteractingRef.current = false;
    resetAutoRotationTimer();
  };

  const handleControlsChange = () => {
    if (!isInteractingRef.current) {
      resetAutoRotationTimer();
    }
  };

  // Initialize auto-rotation
  useEffect(() => {
    resetAutoRotationTimer();
    return () => {
      if (autoRotateTimeoutRef.current) {
        clearTimeout(autoRotateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      {showOverlay && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <h1 className="text-8xl font-bold text-white mb-12 tracking-tight">
            tiny planet.
          </h1>
          <button
            onClick={() => setShowOverlay(false)}
            className="px-12 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
          >
            Start
          </button>
        </div>
      )}
      
      <div className="absolute top-1/3 left-4 -translate-y-1/2 z-10 flex flex-col gap-2">
        {(['mountain', 'tree', 'water', 'house', 'land', 'fire'] as StructureType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`w-12 h-12 rounded-lg font-semibold transition-colors flex items-center justify-center ${
              selectedType === type
                ? 'bg-blue-500 border-2 border-stone-900 text-white shadow-lg shadow-blue-900/50'
                : 'bg-gray-700 border-2 border-stone-900 text-gray-200 hover:bg-gray-600'
            }`}
          >
            <span className="text-2xl">{STRUCTURE_EMOJIS[type]}</span>
          </button>
        ))}
      </div>
      
      {/* Orbit Controls Circle */}
      <div 
        ref={orbitControlsRef}
        className="absolute bottom-4 left-4 w-40 h-40 rounded-full bg-gray-800/30 backdrop-blur-sm border border-gray-600/50 overflow-hidden z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      </div>

      <h1 className="absolute top-6 left-6 text-xl text-white z-10">tiny planet</h1>

      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={RENDER_CONFIG.camera.position}
          fov={RENDER_CONFIG.camera.fov}
          near={RENDER_CONFIG.camera.near}
          far={RENDER_CONFIG.camera.far}
        />
        
        <color attach="background" args={['#000000']} />
        
        <ambientLight 
          intensity={RENDER_CONFIG.ambientLight.intensity} 
          color={RENDER_CONFIG.ambientLight.color} 
        />
        
        <DirectionalLightController />
        
        <Planet selectedType={selectedType} />
        <CloudSystem />
        <ParticleSystem 
          count={600}
          rotationSpeed={0.0001}
          color="#AACCff"
          radius={20}
          size={0.05}
          spread={0.8}
        />
        <ParticleSystem 
          count={300}
          rotationSpeed={0.00005}
          color="#FFEE66"
          radius={10}
          size={0.07}
          spread={0.8}
        />
        
        {orbitDomElement && (
          <OrbitControls 
            ref={controlsRef}
            enablePan={false}
            domElement={orbitDomElement}
            minDistance={RENDER_CONFIG.camera.minDistance}
            maxDistance={RENDER_CONFIG.camera.maxDistance}
            autoRotate
            autoRotateSpeed={RENDER_CONFIG.camera.autoRotateSpeed}
            onChange={handleControlsChange}
            onStart={handleInteractionStart}
            onEnd={handleInteractionEnd}
          />
        )}
        
        <EffectComposer>
          <Bloom 
            intensity={RENDER_CONFIG.postProcessing.bloom.intensity}
            luminanceThreshold={RENDER_CONFIG.postProcessing.bloom.luminanceThreshold}
            luminanceSmoothing={RENDER_CONFIG.postProcessing.bloom.luminanceSmoothing}
          />
          <N8AO {...RENDER_CONFIG.postProcessing.ambientOcclusion} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;