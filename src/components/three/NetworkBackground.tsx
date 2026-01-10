"use client"

import { Canvas } from "@react-three/fiber"
import { FlowField } from "./FlowField"

type NetworkBackgroundProps = {
  className?: string
}

export function NetworkBackground({ className = "" }: NetworkBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 45,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.2} />
        <FlowField rows={32} columns={16} flowFieldAngles={[1, 1, 1]} particleColor="#f97316" particleOpacity={0.12} />
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>
    </div>
  )
}
