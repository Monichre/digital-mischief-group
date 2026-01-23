'use client'

import {useEffect} from 'react'

export function OpenScoutsBodyClass() {
  useEffect(() => {
    const previousCursor = document.body.style.cursor
    document.body.dataset.openScouts = 'true'
    document.body.style.cursor = 'auto'
    return () => {
      delete document.body.dataset.openScouts
      document.body.style.cursor = previousCursor
    }
  }, [])

  return null
}
