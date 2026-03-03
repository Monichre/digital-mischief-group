'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-645LCGRT9T'

// Extend gtag types
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set' | 'consent',
      targetId: string,
      // Third argument can be config object or direct value (for 'set' command)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config?: Record<string, any> | string
    ) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[]
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track pageviews on route changes
  useEffect(() => {
    if (!window.gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      // Custom dimensions
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy='afterInteractive'
      />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Initialize consent mode (GDPR/CCPA compliant)
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });

          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true,
            // Enhanced measurement
            allow_google_signals: true,
            allow_ad_personalization_signals: false,
            // Anonymize IP by default (GA4 does this automatically)
            anonymize_ip: true,
            // Custom config
            cookie_flags: 'SameSite=None;Secure',
            cookie_expires: 63072000, // 2 years
          });
        `}
      </Script>
    </>
  )
}
