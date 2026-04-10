import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

const EngineParts = ({ isPlaying, showInternals, isEditing }: { isPlaying: boolean, showInternals: boolean, isEditing: boolean }) => {
  const [activeTarget, setActiveTarget] = useState<THREE.Object3D | null>(null);
  
  // Refs for animation
  const crankRef = useRef<THREE.Group>(null);
  const displacerPistonRef = useRef<THREE.Mesh>(null);
  const displacerRodRef = useRef<THREE.Group>(null);
  const powerPistonRef = useRef<THREE.Mesh>(null);
  const powerRodRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);

  // Refs for movable parts
  const baseRef = useRef<THREE.Mesh>(null);
  const supportRef = useRef<THREE.Mesh>(null);
  const hotChamberRef = useRef<THREE.Group>(null);
  const coldChamberRef = useRef<THREE.Mesh>(null);
  const burnerRef = useRef<THREE.Group>(null);
  const crankAssemblyRef = useRef<THREE.Group>(null);
  const tubeRef = useRef<THREE.Mesh>(null);

  const time = useRef(0);

  const L_disp = 8;
  const L_pow = 6;
  const crankRadius = 1.5;

  useFrame((state, delta) => {
    if (isPlaying) {
      time.current += delta * 5; // Speed
    }

    const theta = time.current;

    if (crankRef.current) {
      crankRef.current.rotation.z = theta;
    }

    // Displacer Piston (moves along X)
    const pin1X = crankRadius * Math.cos(theta);
    const pin1Y = crankRadius * Math.sin(theta);
    
    // x_disp = pin1X - sqrt(L_disp^2 - pin1Y^2)
    const dispX = pin1X - Math.sqrt(L_disp * L_disp - pin1Y * pin1Y);
    
    if (displacerPistonRef.current) {
      displacerPistonRef.current.position.x = dispX;
    }

    if (displacerRodRef.current) {
      displacerRodRef.current.position.set(dispX, 0, 0);
      const angle = Math.atan2(pin1Y, pin1X - dispX);
      displacerRodRef.current.rotation.z = angle;
    }

    // Power Piston (moves along Y)
    // Pin 2 is at -90 degrees from Pin 1
    const pin2X = crankRadius * Math.cos(theta - Math.PI / 2);
    const pin2Y = crankRadius * Math.sin(theta - Math.PI / 2);

    // y_pow = pin2Y - sqrt(L_pow^2 - pin2X^2)
    const powY = pin2Y - Math.sqrt(L_pow * L_pow - pin2X * pin2X);

    if (powerPistonRef.current) {
      powerPistonRef.current.position.y = powY;
    }

    if (powerRodRef.current) {
      powerRodRef.current.position.set(0, powY, 2);
      const angle = Math.atan2(pin2Y - powY, pin2X);
      powerRodRef.current.rotation.z = angle - Math.PI/2; 
    }

    // Animate flame
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.1;
      flameRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 30) * 0.05;
    }
  });

  // Materials
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#deb887', roughness: 0.9 }), []);
  const canMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#cc0000', 
    metalness: 0.6, 
    roughness: 0.2,
    transparent: true,
    opacity: showInternals ? 0.2 : 1,
    side: THREE.DoubleSide
  }), [showInternals]);
  const pvcMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#8b7355', 
    roughness: 0.7,
    transparent: true,
    opacity: showInternals ? 0.2 : 1,
    side: THREE.DoubleSide
  }), [showInternals]);
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cccccc', metalness: 0.8, roughness: 0.2 }), []);
  const darkMetalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#444444', metalness: 0.9, roughness: 0.4 }), []);
  const pistonMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#eeeeee', metalness: 0.3, roughness: 0.5 }), []);
  const tubeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#add8e6', transparent: true, opacity: 0.6 }), []);

  // Connecting Tube Path
  const tubePath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.25, 9, 0),
    new THREE.Vector3(-1.5, 9, 0),
    new THREE.Vector3(-1.5, 4, 2),
    new THREE.Vector3(-1.25, 4, 2)
  ]), []);

  const handleSelect = (e: any, ref: React.RefObject<THREE.Object3D | null>) => {
    if (isEditing) {
      e.stopPropagation();
      setActiveTarget(ref.current);
    }
  };

  // Deselect when clicking outside (on the canvas background)
  // We can't easily do this on the canvas itself here without a background mesh, 
  // but we can just let them click different parts.

  return (
    <group>
      {isEditing && activeTarget && (
        <TransformControls object={activeTarget} mode="translate" />
      )}

      {/* Base */}
      <mesh 
        ref={baseRef} 
        position={[0, -0.75, 0]} 
        material={woodMaterial} 
        receiveShadow
        onClick={(e) => handleSelect(e, baseRef)}
      >
        <boxGeometry args={[25, 1.5, 12]} />
      </mesh>

      <group position={[5, 0, -1]}>
        {/* Vertical Support */}
      <mesh 
        ref={supportRef} 
        position={[-3, 7.5, 0]} 
        material={woodMaterial} 
        castShadow 
        receiveShadow
        onClick={(e) => handleSelect(e, supportRef)}
      >
        <boxGeometry args={[1.5, 15, 8.2]} />
      </mesh>

      {/* Hot Chamber (Can) */}
      <group 
        ref={hotChamberRef} 
        position={[-8.25, 10, 0]} 
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => handleSelect(e, hotChamberRef)}
      >
        <mesh material={canMaterial} castShadow={!showInternals}>
          <cylinderGeometry args={[2.65, 2.65, 10.5, 32]} />
        </mesh>
        {/* Can Bottom */}
        <mesh position={[0, 5.25, 0]} material={canMaterial}>
          <cylinderGeometry args={[2.65, 2.65, 0.1, 32]} />
        </mesh>
      </group>

      {/* Cold Chamber (PVC Pipe) */}
      <mesh 
        ref={coldChamberRef} 
        position={[0, 2.9, 2]} 
        material={pvcMaterial} 
        castShadow={!showInternals}
        onClick={(e) => handleSelect(e, coldChamberRef)}
      >
        <cylinderGeometry args={[1.25, 1.25, 5.8, 32]} />
      </mesh>

      {/* Connecting Tube */}
      <mesh 
        ref={tubeRef} 
        castShadow
        onClick={(e) => handleSelect(e, tubeRef)}
      >
        <tubeGeometry args={[tubePath, 20, 0.4, 8, false]} />
        <primitive object={tubeMaterial} attach="material" />
      </mesh>

      {/* Crankshaft Assembly (Includes Crank, Flywheel, Pistons, and Rods) */}
      <group 
        ref={crankAssemblyRef} 
        position={[0, 10, 0]}
        onClick={(e) => handleSelect(e, crankAssemblyRef)}
      >
        <group ref={crankRef}>
          {/* Segment 1: z=-1 to -0.5 */}
          <mesh position={[0, 0, -0.75]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          </mesh>
          {/* Arm 1: z=-0.5, x=0 to crankRadius */}
          <mesh position={[crankRadius / 2, 0, -0.5]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, crankRadius, 16]} />
          </mesh>
          {/* Pin 1: x=crankRadius, z=-0.5 to 0.5 */}
          <mesh position={[crankRadius, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
          </mesh>
          {/* Arm 2: z=0.5, x=crankRadius to 0 */}
          <mesh position={[crankRadius / 2, 0, 0.5]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, crankRadius, 16]} />
          </mesh>
          {/* Segment 2: z=0.5 to 1.5 */}
          <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
          </mesh>
          {/* Arm 3: z=1.5, y=0 to -crankRadius */}
          <mesh position={[0, -crankRadius / 2, 1.5]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, crankRadius, 16]} />
          </mesh>
          {/* Pin 2: y=-crankRadius, z=1.5 to 2.5 */}
          <mesh position={[0, -crankRadius, 2]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
          </mesh>
          {/* Arm 4: z=2.5, y=-crankRadius to 0 */}
          <mesh position={[0, -crankRadius / 2, 2.5]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, crankRadius, 16]} />
          </mesh>
          {/* Segment 3: z=2.5 to 5 */}
          <mesh position={[0, 0, 3.75]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 2.5, 16]} />
          </mesh>

          {/* Flywheel */}
          <mesh position={[0, 0, 4]} rotation={[Math.PI / 2, 0, 0]} material={darkMetalMaterial} castShadow>
            <cylinderGeometry args={[4, 4, 1.5, 32]} />
          </mesh>
        </group>

        {/* Displacer Piston */}
        <mesh ref={displacerPistonRef} position={[-8, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={pistonMaterial}>
          <cylinderGeometry args={[2.4, 2.4, 4, 32]} />
        </mesh>

        {/* Displacer Rod */}
        <group ref={displacerRodRef}>
          <mesh position={[L_disp / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, L_disp, 16]} />
          </mesh>
        </group>

        {/* Power Piston */}
        <mesh ref={powerPistonRef} position={[0, -6, 2]} material={darkMetalMaterial}>
          <cylinderGeometry args={[1.2, 1.2, 2, 32]} />
        </mesh>

        {/* Power Rod */}
        <group ref={powerRodRef}>
          <mesh position={[0, L_pow / 2, 0]} material={metalMaterial} castShadow>
            <cylinderGeometry args={[0.1, 0.1, L_pow, 16]} />
          </mesh>
        </group>
      </group>

      {/* Burner */}
      <group 
        ref={burnerRef} 
        position={[-9, 2.5, 0]}
        onClick={(e) => handleSelect(e, burnerRef)}
      >
        <mesh material={darkMetalMaterial} castShadow>
          <cylinderGeometry args={[1.5, 2, 5, 32]} />
        </mesh>
        {/* Flame */}
        <mesh ref={flameRef} position={[0, 3.5, 0]}>
          <coneGeometry args={[0.8, 3, 16]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <coneGeometry args={[0.5, 2, 16]} />
          <meshBasicMaterial color="#00aaff" transparent opacity={0.8} />
        </mesh>
      </group>
      </group>
    </group>
  );
};

export default function EngineScene({ isPlaying, showInternals, isEditing }: { isPlaying: boolean, showInternals: boolean, isEditing: boolean }) {
  return (
    <Canvas shadows camera={{ position: [15, 15, 25], fov: 45 }}>
      <color attach="background" args={['#111827']} />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 15]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 5, 0]} intensity={2} color="#ffaa00" distance={15} />
      
      <EngineParts isPlaying={isPlaying} showInternals={showInternals} isEditing={isEditing} />
      
      <OrbitControls makeDefault target={[2, 5, 0]} enableDamping dampingFactor={0.05} />
      <Environment preset="city" />
    </Canvas>
  );
}
