"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { BootSequence } from "./BootSequence"

const BOOT_SESSION_KEY = "digital_mischief_booted"

interface BootWrapperProps {
  children: React.ReactNode
}

export function BootWrapper({ children }: BootWrapperProps) {
  const [showBoot, setShowBoot] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if already booted this session
    const hasBooted = sessionStorage.getItem(BOOT_SESSION_KEY)
    if (!hasBooted) {
      setShowBoot(true)
    }
    setIsReady(true)
  }, [])

  const handleBootComplete = () => {
    sessionStorage.setItem(BOOT_SESSION_KEY, "true")
    setShowBoot(false)
  }

  // Don't render anything until we check session storage (prevents flash)
  if (!isReady) {
    return <div className="fixed inset-0 bg-black" />
  }

  return (
    <>
      {showBoot && <BootSequence onComplete={handleBootComplete} />}
      <div style={{ visibility: showBoot ? "hidden" : "visible" }}>{children}</div>
    </>
  )
}
