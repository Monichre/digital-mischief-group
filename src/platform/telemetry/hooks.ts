'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent, trackButtonClick, trackLinkClick } from './events'

/**
 * Hook to automatically track page views
 */
export const usePageTracking = () => {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view
    trackEvent('page_view', {
      page_path: pathname,
      page_title: document.title,
    })
  }, [pathname])
}

/**
 * Hook to track button clicks
 */
export const useTrackClick = (eventName: string, metadata?: Record<string, any>) => {
  return useCallback(() => {
    trackButtonClick(eventName, metadata?.location)
    if (metadata) {
      trackEvent(eventName, metadata)
    }
  }, [eventName, metadata])
}

/**
 * Hook to track external link clicks
 */
export const useTrackExternalLinks = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href) {
        const isExternal = link.hostname !== window.location.hostname
        trackLinkClick(link.textContent || link.href, link.href, isExternal)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}

/**
 * Hook to track time on page
 */
export const useTimeOnPage = () => {
  const pathname = usePathname()

  useEffect(() => {
    const startTime = Date.now()

    return () => {
      const timeSpent = Date.now() - startTime
      trackEvent('time_on_page', {
        page_path: pathname,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.round(timeSpent / 1000),
      })
    }
  }, [pathname])
}

/**
 * Hook to track scroll depth
 */
export const useScrollTracking = () => {
  useEffect(() => {
    let maxScrollDepth = 0
    const depths = [25, 50, 75, 100]
    const tracked = new Set<number>()

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (window.scrollY / scrollHeight) * 100

      maxScrollDepth = Math.max(maxScrollDepth, scrolled)

      depths.forEach((depth) => {
        if (scrolled >= depth && !tracked.has(depth)) {
          tracked.add(depth)
          trackEvent('scroll_depth', {
            depth_percentage: depth,
            page_path: window.location.pathname,
          })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
