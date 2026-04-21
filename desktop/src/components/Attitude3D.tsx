import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import type { AttitudeData } from "../protocol";

function BoardModel({ attitude }: { attitude: AttitudeData | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetQuat = useRef(new THREE.Quaternion());

  useFrame(() => {
    if (!groupRef.current) return;
    if (attitude) {
      targetQuat.current.set(attitude.q1, attitude.q2, attitude.q3, attitude.q0);
    }
    groupRef.current.quaternion.slerp(targetQuat.current, 0.15);
  });

  return (
    <group ref={groupRef}>
      {/* PCB Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.12, 2.2]} />
        <meshStandardMaterial color="#1b8a4a" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Ground plane on PCB */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[3.18, 0.005, 2.18]} />
        <meshStandardMaterial color="#1a7d43" roughness={0.8} />
      </mesh>

      {/* MCU Chip */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#1a1c1c" roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Chip label */}
      <Text
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="#555"
        font={undefined}
      >
        H723
      </Text>

      {/* IMU Chip */}
      <mesh position={[-0.8, 0.12, -0.5]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* USB Connector */}
      <mesh position={[1.65, 0.1, 0]} castShadow>
        <boxGeometry args={[0.25, 0.18, 0.45]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Direction arrow (front indicator) */}
      <mesh position={[1.3, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.25, 3]} />
        <meshStandardMaterial color="#e53935" roughness={0.5} />
      </mesh>

      {/* Axis arrows */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2.5, 0xe53935, 0.15, 0.08]} />
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 2.5, 0x43a047, 0.15, 0.08]} />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 2.5, 0x1e88e5, 0.15, 0.08]} />
    </group>
  );
}

export default function Attitude3D({ attitude }: { attitude: AttitudeData | null }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [4, 3, 4], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 10, 6]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 4, -4]} intensity={0.3} />

        <BoardModel attitude={attitude} />

        <Grid
          args={[12, 12]}
          position={[0, -2, 0]}
          cellColor="#e2e2e2"
          sectionColor="#c1c6d7"
          fadeDistance={18}
          fadeStrength={1}
          cellSize={1}
          sectionSize={4}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={12}
        />

        {/* Axis labels */}
        <Text position={[2.8, 0, 0]} fontSize={0.22} color="#e53935">X</Text>
        <Text position={[0, 2.8, 0]} fontSize={0.22} color="#43a047">Y</Text>
        <Text position={[0, 0, 2.8]} fontSize={0.22} color="#1e88e5">Z</Text>
      </Canvas>
    </div>
  );
}
