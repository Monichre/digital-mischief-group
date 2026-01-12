'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateConsent } from '@/lib/analytics/events'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      // Show banner after 2 seconds
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    } else {
      // Apply saved consent
      updateConsent(consent === 'granted')
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted')
    updateConsent(true)
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied')
    updateConsent(false)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 border-t border-gray-800 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-300">
          <p>
            We use cookies to analyze site traffic and improve your experience. By clicking "Accept", you consent to our use of analytics cookies.{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Decline
          </Button>
          <Button onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700">
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
