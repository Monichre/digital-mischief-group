/**
 * Google Analytics 4 Event Tracking Utilities
 *
 * Comprehensive event tracking for user interactions, conversions, and engagement.
 * Integrates with Better Auth for user identification.
 */

// Event parameter types
export interface EventParams {
  [key: string]: string | number | boolean | undefined
}

export interface UserProperties {
  user_id?: string
  user_type?: 'free' | 'pro' | 'enterprise' | 'guest'
  subscription_status?: 'active' | 'trial' | 'cancelled' | 'none'
  signup_date?: string
  last_login?: string
  total_sessions?: number
  [key: string]: string | number | boolean | undefined
}

/**
 * Track custom events to Google Analytics
 */
export const trackEvent = (
  eventName: string,
  params?: EventParams
): void => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('GA not initialized')
    return
  }

  try {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

/**
 * Set user properties for better segmentation
 */
export const setUserProperties = (properties: UserProperties): void => {
  if (typeof window === 'undefined' || !window.gtag) return

  try {
    window.gtag('set', 'user_properties', properties)
  } catch (error) {
    console.error('Error setting user properties:', error)
  }
}

/**
 * Identify a user (after login/signup)
 */
export const identifyUser = (userId: string, properties?: UserProperties): void => {
  if (typeof window === 'undefined' || !window.gtag) return

  try {
    window.gtag('set', 'user_id', userId)

    if (properties) {
      setUserProperties({
        user_id: userId,
        ...properties,
      })
    }
  } catch (error) {
    console.error('Error identifying user:', error)
  }
}

/**
 * Update consent settings
 */
export const updateConsent = (granted: boolean): void => {
  if (typeof window === 'undefined' || !window.gtag) return

  try {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
    })
  } catch (error) {
    console.error('Error updating consent:', error)
  }
}

// ============================================================================
// Pre-defined Event Tracking Functions
// ============================================================================

/**
 * Authentication Events
 */
export const trackSignUp = (method: 'email' | 'google' | 'github'): void => {
  trackEvent('sign_up', {
    method,
    page_path: window.location.pathname,
  })
}

export const trackLogin = (method: 'email' | 'google' | 'github'): void => {
  trackEvent('login', {
    method,
    page_path: window.location.pathname,
  })
}

/**
 * Lead Capture Events
 */
export const trackNewsletterSignup = (email: string, source: string): void => {
  trackEvent('newsletter_signup', {
    source,
    has_email: !!email,
    page_path: window.location.pathname,
  })
}

export const trackWaitlistJoin = (email: string, feature?: string): void => {
  trackEvent('waitlist_join', {
    feature: feature || 'general',
    has_email: !!email,
    page_path: window.location.pathname,
  })
}

export const trackContactFormSubmit = (formType: string): void => {
  trackEvent('contact_form_submit', {
    form_type: formType,
    page_path: window.location.pathname,
  })
}

/**
 * Feature Usage Events
 */
export const trackEnrichment = (
  action: 'start' | 'complete' | 'error',
  rowCount?: number
): void => {
  trackEvent('enrichment', {
    action,
    row_count: rowCount,
    page_path: window.location.pathname,
  })
}

export const trackBrandRecon = (
  action: 'start' | 'complete' | 'error',
  url?: string
): void => {
  trackEvent('brand_recon', {
    action,
    has_url: !!url,
    page_path: window.location.pathname,
  })
}

export const trackScout = (
  action: 'create' | 'update' | 'delete' | 'run',
  scoutId?: string
): void => {
  trackEvent('scout_action', {
    action,
    scout_id: scoutId,
    page_path: window.location.pathname,
  })
}

/**
 * Engagement Events
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: location || window.location.pathname,
  })
}

export const trackLinkClick = (linkText: string, linkUrl: string, isExternal: boolean): void => {
  trackEvent('link_click', {
    link_text: linkText,
    link_url: linkUrl,
    is_external: isExternal,
    page_path: window.location.pathname,
  })
}

/**
 * Subscription Events
 */
export const trackSubscriptionStart = (plan: string, price?: number): void => {
  trackEvent('begin_checkout', {
    plan_name: plan,
    price,
    currency: 'USD',
    page_path: window.location.pathname,
  })
}

export const trackSubscriptionComplete = (
  plan: string,
  price: number,
  transactionId: string
): void => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: price,
    currency: 'USD',
    plan_name: plan,
    page_path: window.location.pathname,
  })
}
