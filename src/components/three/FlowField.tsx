"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Instance, Instances } from "@react-three/drei"

type FlowFieldProps = {
  flowFieldFn?: (props: { flowFieldBuffer: Float32Array; instanceIndex: number }) => void
  rows?: number
  columns?: number
  flowFieldAngles?: [number, number, number]
  particleColor?: string
  lineWidth?: number
  particleOpacity?: number
}

export function FlowField({
  rows = 32,
  columns = 16,
  flowFieldAngles = [1, 1, 1],
  particleColor = "#f97316",
  lineWidth = 0.5,
  particleOpacity = 0.15,
}: FlowFieldProps) {
  const particlesRef = useRef<THREE.InstancedMesh>(null)
  const count = rows * columns

  const particles = useMemo(() => {
    const positions = []
    const angles = []

    // Create grid of particles
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const x = (j / columns) * 20 - 10
        const y = (i / rows) * 20 - 10
        positions.push([x, y, 0])

        // Random initial angle from predefined set
        const angleOptions = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI]
        const randomAngle = angleOptions[Math.floor(Math.random() * angleOptions.length)]
        angles.push(randomAngle)
      }
    }

    return { positions, angles }
  }, [rows, columns])

  const velocities = useRef(
    particles.positions.map(() => ({
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
    })),
  )

  useFrame((state) => {
    if (!particlesRef.current) return

    const time = state.clock.elapsedTime
    const tempMatrix = new THREE.Matrix4()

    particles.positions.forEach(([x, y, z], i) => {
      const angle = particles.angles[i]
      const velocity = velocities.current[i]

      // Update position based on angle and velocity
      const newX = x + Math.cos(angle + time * 0.1) * velocity.x
      const newY = y + Math.sin(angle + time * 0.1) * velocity.y

      // Wrap around edges
      const wrappedX = ((newX + 10) % 20) - 10
      const wrappedY = ((newY + 10) % 20) - 10

      particles.positions[i] = [wrappedX, wrappedY, z]

      // Create connection lines effect with neighboring particles
      const scale = 0.05 + Math.sin(time * 0.5 + i * 0.1) * 0.02

      tempMatrix.makeTranslation(wrappedX, wrappedY, z)
      tempMatrix.scale(new THREE.Vector3(scale, scale, scale))

      particlesRef.current!.setMatrixAt(i, tempMatrix)
    })

    particlesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <Instances ref={particlesRef} limit={count}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={particleColor} transparent opacity={particleOpacity} />
        {particles.positions.map((pos, i) => (
          <Instance key={i} position={pos as [number, number, number]} />
        ))}
      </Instances>

      {/* Grid lines for network effect */}
      <gridHelper args={[20, 20, particleColor, particleColor]} rotation={[Math.PI / 2, 0, 0]} />
    </>
  )
}
