"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, useRef, useCallback } from "react"

const Globe = dynamic(
  () => import("react-globe.gl").then((mod) => mod.default || mod),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-emerald-950/20 animate-pulse flex items-center justify-center">
        <span className="text-emerald-700 text-xs tracking-widest">LOADING_GLOBE...</span>
      </div>
    ),
  }
)

const NODES = [
  { id: "us-east", lat: 40.7, lng: -74.0, name: "US-EAST", status: "active" },
  { id: "us-west", lat: 37.7, lng: -122.4, name: "US-WEST", status: "active" },
  { id: "eu-west", lat: 51.5, lng: -0.1, name: "EU-WEST", status: "active" },
  { id: "eu-central", lat: 48.8, lng: 2.3, name: "EU-CENTRAL", status: "active" },
  { id: "asia-east", lat: 35.6, lng: 139.6, name: "ASIA-EAST", status: "warning" },
  { id: "asia-south", lat: 1.3, lng: 103.8, name: "ASIA-SOUTH", status: "active" },
  { id: "asia-north", lat: 39.9, lng: 116.4, name: "ASIA-NORTH", status: "threat" },
  { id: "oceania", lat: -33.8, lng: 151.2, name: "OCEANIA", status: "active" },
  { id: "sa-prime", lat: -23.5, lng: -46.6, name: "SA-PRIME", status: "active" },
  { id: "africa", lat: -26.2, lng: 28.0, name: "AFRICA", status: "warning" },
  { id: "middle-east", lat: 25.2, lng: 55.2, name: "MIDDLE-EAST", status: "active" },
  { id: "russia", lat: 55.7, lng: 37.6, name: "RUSSIA", status: "threat" },
]

const STATUS_COLORS = {
  active: "#10b981",
  warning: "#f59e0b",
  threat: "#ef4444",
}

const generateArcs = () => {
  const connections = [
    // Primary backbone - 3 main intercontinental routes
    { from: "us-east", to: "eu-west", type: "backbone" },
    { from: "us-west", to: "asia-east", type: "backbone" },
    { from: "eu-central", to: "asia-south", type: "backbone" },

    // Regional connections - no overlaps
    { from: "us-east", to: "us-west", type: "secondary" },
    { from: "eu-west", to: "eu-central", type: "secondary" },
    { from: "asia-east", to: "asia-south", type: "secondary" },
    { from: "oceania", to: "asia-south", type: "secondary" },
    { from: "us-east", to: "sa-prime", type: "secondary" },
    { from: "eu-west", to: "africa", type: "secondary" },
    { from: "eu-central", to: "middle-east", type: "secondary" },

    // Threat routes - isolated
    { from: "asia-north", to: "russia", type: "threat" },
  ]

  return connections.map((conn, i) => {
    const fromNode = NODES.find((n) => n.id === conn.from)!
    const toNode = NODES.find((n) => n.id === conn.to)!

    const typeConfig = {
      backbone: { stroke: 1.5, dashLen: 0.8, gap: 0.4, speed: 2500, color: "#10b981" },
      secondary: { stroke: 0.8, dashLen: 0.5, gap: 0.8, speed: 3500, color: "#059669" },
      threat: { stroke: 1.2, dashLen: 0.3, gap: 0.3, speed: 1200, color: "#ef4444" },
    }[conn.type]!

    return {
      startLat: fromNode.lat,
      startLng: fromNode.lng,
      endLat: toNode.lat,
      endLng: toNode.lng,
      color: typeConfig.color,
      stroke: typeConfig.stroke,
      dashLen: typeConfig.dashLen,
      gap: typeConfig.gap,
      speed: typeConfig.speed,
      initialGap: conn.type === "backbone" ? i * 0.3 : conn.type === "threat" ? 0 : i * 0.15,
      type: conn.type,
    }
  })
}

const generatePoints = () => {
  return NODES.map((node) => ({
    lat: node.lat,
    lng: node.lng,
    name: node.name,
    size: node.status === "threat" ? 0.8 : node.status === "warning" ? 0.6 : 0.5,
    color: STATUS_COLORS[node.status as keyof typeof STATUS_COLORS],
    status: node.status,
  }))
}

const generateRings = () => {
  return NODES.filter((n) => n.status === "threat").map((node) => ({
    lat: node.lat,
    lng: node.lng,
    maxR: 2.5,
    propagationSpeed: 3,
    repeatPeriod: 1200,
    color: STATUS_COLORS.threat,
  }))
}

export function HoloGlobe() {
  const [mounted, setMounted] = useState(false)
  const [arcsData] = useState(generateArcs()) // Removed dynamic arc updates that caused flickering
  const globeRef = useRef<unknown>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && globeRef.current) {
      const globe = globeRef.current as { controls: () => { autoRotate: boolean; autoRotateSpeed: number } }
      if (globe.controls) {
        const controls = globe.controls()
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.3
      }
    }
  }, [mounted])

  const getArcColor = useCallback((d: { color: string }) => d.color, [])
  const getArcStroke = useCallback((d: { stroke: number }) => d.stroke, [])
  const getArcDashLength = useCallback((d: { dashLen: number }) => d.dashLen, [])
  const getArcDashGap = useCallback((d: { gap: number }) => d.gap, [])
  const getArcDashInitialGap = useCallback((d: { initialGap: number }) => d.initialGap, [])
  const getArcDashAnimateTime = useCallback((d: { speed: number }) => d.speed, [])

  if (!mounted) {
    return (
      <div className="w-full h-[300px] bg-emerald-950/20 animate-pulse flex items-center justify-center">
        <span className="text-emerald-700 text-xs tracking-widest">INITIALIZING_GLOBE...</span>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] cursor-move relative overflow-hidden bg-black rounded-sm group">
      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#000_100%)]" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-emerald-700 z-20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-emerald-700 z-20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-emerald-700 z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-emerald-700 z-20" />

      <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-emerald-600 tracking-widest">LIVE</span>
      </div>

      <div className="absolute top-2 right-2 z-20 text-[10px] text-emerald-700 tracking-widest">
        {NODES.length} NODES
      </div>

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#10b981"
        atmosphereAltitude={0.15}
        width={400}
        height={300}
        arcsData={arcsData}
        arcColor={getArcColor}
        arcDashLength={getArcDashLength}
        arcDashGap={getArcDashGap}
        arcDashInitialGap={getArcDashInitialGap}
        arcDashAnimateTime={getArcDashAnimateTime}
        arcStroke={getArcStroke}
        arcAltitudeAutoScale={0.3}
        pointsData={generatePoints()}
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointsMerge={true}
        ringsData={generateRings()}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
      />

      <div className="absolute bottom-2 left-2 z-20 flex gap-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-[2px] bg-emerald-500" />
          <span className="text-[8px] text-emerald-600">BACKBONE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-[2px] bg-emerald-700" />
          <span className="text-[8px] text-emerald-700">REGIONAL</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-[2px] bg-red-500" />
          <span className="text-[8px] text-red-600">THREAT</span>
        </div>
      </div>
    </div>
  )
}
