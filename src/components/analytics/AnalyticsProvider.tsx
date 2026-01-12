'use client'

import { useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { identifyUser, setUserProperties, trackSessionStart } from '@/lib/analytics/events'
import { usePageTracking, useTimeOnPage, useScrollTracking } from '@/lib/analytics/hooks'

/**
 * AnalyticsProvider - Integrates Better Auth with Google Analytics
 *
 * Features:
 * - Identifies logged-in users
 * - Sets user properties for segmentation
 * - Tracks sessions and engagement
 * - Automatically tracks page views, time on page, scroll depth
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()

  // Enable automatic tracking hooks
  usePageTracking()
  useTimeOnPage()
  useScrollTracking()

  // Track session start
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
      trackSessionStart()
    }
  }, [])

  // Identify user when authenticated
  useEffect(() => {
    if (isPending || !session?.user) return

    const user = session.user

    // Identify user in GA4
    identifyUser(user.id, {
      user_id: user.id,
      user_type: 'free', // TODO: Update based on subscription
      signup_date: user.createdAt || new Date().toISOString(),
      last_login: new Date().toISOString(),
    })

    // Set additional user properties
    setUserProperties({
      email: user.email,
      name: user.name || undefined,
      has_subscription: false, // TODO: Check actual subscription status
    })
  }, [session, isPending])

  return <>{children}</>
}
