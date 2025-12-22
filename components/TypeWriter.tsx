'use client'

import {useState, useEffect} from 'react'

interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
}

export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}: TypeWriterProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [displayedText, text, speed, started, onComplete])

  return (
    <span className={className}>
      {displayedText}
      <span className='animate-pulse'>|</span>
    </span>
  )
}
