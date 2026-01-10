'use client'

import {useState, useEffect, memo} from 'react'
import {motion} from 'framer-motion'

/**
 * FloatingStatus - HUD-style floating status elements
 * Creates ambient data display around content areas
 */
export const FloatingStatus = memo(function FloatingStatus() {
  const [systemTime, setSystemTime] = useState('')
  const [metrics, setMetrics] = useState({
    threats: 0,
    uptime: '99.97%',
    latency: '12ms',
    signals: 0,
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setSystemTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }

    const updateMetrics = () => {
      setMetrics({
        threats: Math.floor(Math.random() * 15),
        uptime: `${(99 + Math.random() * 0.99).toFixed(2)}%`,
        latency: `${Math.floor(8 + Math.random() * 20)}ms`,
        signals: Math.floor(Math.random() * 200) + 50,
      })
    }

    updateTime()
    updateMetrics()

    const timeInterval = setInterval(updateTime, 1000)
    const metricsInterval = setInterval(updateMetrics, 5000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(metricsInterval)
    }
  }, [])

  return (
    <>
      {/* Top-left status block */}
      <div className='absolute left-6 top-24 hidden space-y-1 font-mono text-[10px] text-zinc-600 opacity-40 md:block'>
        <div>SYS.TIME: {systemTime}</div>
        <div>UPTIME: {metrics.uptime}</div>
        <div className='text-orange-500/60'>
          THREATS.DETECTED: {metrics.threats}
        </div>
      </div>

      {/* Top-right status block */}
      <div className='absolute right-6 top-24 hidden space-y-1 text-right font-mono text-[10px] text-zinc-600 opacity-40 md:block'>
        <div>LAT: 37.7749° N</div>
        <div>LNG: 122.4194° W</div>
        <div>LATENCY: {metrics.latency}</div>
      </div>

      {/* Left edge data stream */}
      <div className='pointer-events-none absolute bottom-1/3 left-0 top-1/3 w-px overflow-hidden opacity-20'>
        <motion.div
          className='w-full bg-gradient-to-b from-transparent via-orange-500 to-transparent'
          style={{height: '200%'}}
          animate={{y: ['-50%', '0%']}}
          transition={{duration: 4, repeat: Infinity, ease: 'linear'}}
        />
      </div>

      {/* Right edge data stream */}
      <div className='pointer-events-none absolute bottom-1/3 right-0 top-1/3 w-px overflow-hidden opacity-20'>
        <motion.div
          className='w-full bg-gradient-to-b from-transparent via-orange-500 to-transparent'
          style={{height: '200%'}}
          animate={{y: ['0%', '-50%']}}
          transition={{duration: 3, repeat: Infinity, ease: 'linear'}}
        />
      </div>

      {/* Bottom-left signal indicator */}
      <div className='absolute bottom-24 left-6 hidden font-mono text-[10px] text-zinc-700 opacity-40 md:block'>
        <div className='flex items-center gap-2'>
          <div className='flex gap-0.5'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='w-0.5 animate-pulse bg-orange-500/50'
                style={{
                  height: `${4 + i * 2}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span>SIGNALS: {metrics.signals}</span>
        </div>
      </div>
    </>
  )
})
