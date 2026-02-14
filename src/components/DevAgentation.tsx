"use client"

import { useEffect, useState } from 'react'
import { Agentation } from 'agentation'

export function DevAgentation() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (navigator.webdriver) return
    setShouldRender(true)
  }, [])

  if (!shouldRender) return null
  return <Agentation clientId='dmg-client' />
}
