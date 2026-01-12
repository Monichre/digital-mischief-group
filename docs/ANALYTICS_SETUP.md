# Google Analytics 4 Implementation Guide

## Overview

This comprehensive analytics implementation provides:

✅ **Enhanced GA4 tracking** with custom events
✅ **Lead capture system** for emails and contact info
✅ **Visitor identification** integrated with Better Auth
✅ **Privacy-compliant** cookie consent (GDPR/CCPA)
✅ **Custom analytics dashboard** API
✅ **Automatic tracking** for pageviews, time on page, scroll depth

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Component Usage](#component-usage)
5. [Event Tracking](#event-tracking)
6. [Lead Capture](#lead-capture)
7. [Analytics Dashboard](#analytics-dashboard)
8. [Privacy & Compliance](#privacy--compliance)
9. [Advanced Features](#advanced-features)

---

## Quick Start

### 1. Database Setup

Run the SQL migration to create analytics tables:

```bash
psql $DATABASE_URL -f scripts/create_leads_table.sql
```

This creates 4 tables:
- `leads` - Captured emails and contact info
- `analytics_events` - Custom event tracking
- `page_views` - Page view metrics with engagement
- `visitor_sessions` - Session tracking for cohort analysis

### 2. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-645LCGRT9T
```

### 3. Verify Installation

The analytics are already integrated into your root layout. Verify by:

1. Visit any page on your site
2. Open Chrome DevTools → Network tab
3. Filter by "gtag" or "google-analytics"
4. You should see requests to `www.google-analytics.com`

---

## Component Usage

### Automatic Tracking

These are **automatically enabled** in your root layout:

- ✅ Pageviews on route changes
- ✅ Time spent on each page
- ✅ Scroll depth (25%, 50%, 75%, 100%)
- ✅ External link clicks
- ✅ User identification (when logged in)
- ✅ Session tracking

### Lead Capture Modal

Add a lead capture modal to any page:

```tsx
import { LeadCaptureModal } from '@/components/analytics/LeadCaptureModal'

export default function Page() {
  return (
    <>
      <YourPageContent />

      {/* Newsletter signup - shows after 30 seconds */}
      <LeadCaptureModal
        type="newsletter"
        trigger="time"
        delayMs={30000}
      />

      {/* Waitlist for specific feature - shows on 75% scroll */}
      <LeadCaptureModal
        type="waitlist"
        feature="Brand Recon"
        trigger="scroll"
      />

      {/* Exit intent popup */}
      <LeadCaptureModal
        type="newsletter"
        trigger="exit"
      />
    </>
  )
}
```

**Trigger Options:**
- `time` - Show after delay (default: 30s)
- `scroll` - Show when user scrolls 75% down page
- `exit` - Show when mouse leaves viewport (exit intent)
- `manual` - Control with state

**Features:**
- ✅ Prevents duplicate signups (localStorage)
- ✅ Tracks source and trigger type
- ✅ Saves to database automatically
- ✅ Sends to Google Analytics
- ✅ Mobile-responsive

---

## Event Tracking

### Pre-built Event Functions

Import from `@/lib/analytics/events`:

```tsx
import {
  trackSignUp,
  trackLogin,
  trackNewsletterSignup,
  trackWaitlistJoin,
  trackEnrichment,
  trackBrandRecon,
  trackScout,
  trackButtonClick,
  trackSubscriptionStart,
  trackSubscriptionComplete,
} from '@/lib/analytics/events'
```

### Usage Examples

#### Authentication Events

```tsx
'use client'

import { trackSignUp, trackLogin } from '@/lib/analytics/events'

function SignUpForm() {
  const handleSignUp = async (email: string, method: 'email' | 'google') => {
    // Your signup logic
    await signUp(email, method)

    // Track the signup
    trackSignUp(method)
  }

  return <form onSubmit={handleSignUp}>...</form>
}
```

#### Feature Usage Events

```tsx
import { trackEnrichment } from '@/lib/analytics/events'

async function enrichLeads(csvData: any[]) {
  // Track start
  trackEnrichment('start', csvData.length)

  try {
    const results = await enrichData(csvData)

    // Track completion
    trackEnrichment('complete', results.length)

    return results
  } catch (error) {
    // Track error
    trackEnrichment('error')
    throw error
  }
}
```

#### Button Click Events

```tsx
import { trackButtonClick } from '@/lib/analytics/events'

function CallToAction() {
  return (
    <button
      onClick={() => {
        trackButtonClick('cta_upgrade', 'homepage_hero')
        // Handle click
      }}
    >
      Upgrade to Pro
    </button>
  )
}
```

### Custom Events

For custom events not covered by pre-built functions:

```tsx
import { trackEvent } from '@/lib/analytics/events'

trackEvent('custom_event_name', {
  property1: 'value1',
  property2: 123,
  property3: true,
})
```

---

## Lead Capture

### Capturing Leads

Leads are automatically saved when users submit forms through `LeadCaptureModal`. They're stored in the `leads` table with:

- Email (required)
- Name (optional)
- Type (newsletter, waitlist, contact)
- Source (time, scroll, exit, manual)
- IP address
- User agent
- Referrer
- Landing page
- Metadata (JSON)

### Accessing Lead Data

**Via API:**

```bash
# Get all leads
GET /api/leads

# Get leads by type
GET /api/leads?type=newsletter

# Limit results
GET /api/leads?limit=50
```

**Via Database:**

```sql
-- Recent newsletter signups
SELECT email, name, created_at
FROM leads
WHERE type = 'newsletter'
ORDER BY created_at DESC
LIMIT 20;

-- Waitlist by feature
SELECT feature, COUNT(*) as count
FROM leads
WHERE type = 'waitlist'
GROUP BY feature;

-- Top referrers
SELECT referrer, COUNT(*) as count
FROM leads
WHERE referrer IS NOT NULL
GROUP BY referrer
ORDER BY count DESC;
```

---

## Analytics Dashboard

### API Endpoint

```bash
GET /api/analytics/stats?days=30
```

**Returns:**

```json
{
  "success": true,
  "period": {
    "days": 30,
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-30T23:59:59Z"
  },
  "summary": {
    "total_leads": 156,
    "total_page_views": 4523,
    "conversion_rate": "3.45%"
  },
  "leads_by_type": [
    { "type": "newsletter", "count": 89 },
    { "type": "waitlist", "count": 67 }
  ],
  "leads_by_day": [
    { "date": "2024-01-01", "count": 5 },
    { "date": "2024-01-02", "count": 8 }
  ],
  "top_referrers": [
    { "referrer": "google.com", "count": 45 },
    { "referrer": "twitter.com", "count": 23 }
  ],
  "recent_leads": [...]
}
```

### Example Dashboard Component

```tsx
'use client'

import { useEffect, useState } from 'react'

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/analytics/stats?days=30')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

  if (!stats) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="stat-card">
        <h3>Total Leads</h3>
        <p className="text-3xl">{stats.summary.total_leads}</p>
      </div>
      <div className="stat-card">
        <h3>Page Views</h3>
        <p className="text-3xl">{stats.summary.total_page_views}</p>
      </div>
      <div className="stat-card">
        <h3>Conversion Rate</h3>
        <p className="text-3xl">{stats.summary.conversion_rate}</p>
      </div>
    </div>
  )
}
```

---

## Privacy & Compliance

### Cookie Consent

The `CookieConsent` component is automatically included in your layout. It:

- ✅ Shows after 2 seconds on first visit
- ✅ Stores consent in localStorage
- ✅ Updates GA4 consent mode
- ✅ Respects user choice across sessions
- ✅ GDPR & CCPA compliant

### Consent Modes

**Default (before user interaction):**
- `analytics_storage: denied`
- `ad_storage: denied`

**After user accepts:**
- `analytics_storage: granted`
- `ad_storage: granted`

**After user declines:**
- `analytics_storage: denied`
- `ad_storage: denied`

### IP Anonymization

GA4 automatically anonymizes IP addresses. For additional privacy, leads are stored with IP addresses but you can:

```sql
-- Remove IP addresses from old leads
UPDATE leads
SET ip_address = NULL
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Advanced Features

### User Identification

When users log in via Better Auth, they're automatically identified in GA4:

```tsx
// Happens automatically in AnalyticsProvider
identifyUser(userId, {
  user_type: 'pro',
  subscription_status: 'active',
  signup_date: '2024-01-01',
})
```

### Session Tracking

Sessions are automatically tracked with:
- Session ID (generated per browser session)
- Page count
- Event count
- Session duration
- User identification (when logged in)

### Performance Tracking

Track custom performance metrics:

```tsx
import { trackPerformance } from '@/lib/analytics/events'

const startTime = performance.now()
// ... do something
const endTime = performance.now()

trackPerformance('custom_operation', endTime - startTime, 'ms')
```

### Error Tracking

Track errors for debugging:

```tsx
import { trackError, trackAPIError } from '@/lib/analytics/events'

try {
  await riskyOperation()
} catch (error) {
  trackError('operation_failed', error.message, 'component_name')
}

// Track API errors
fetch('/api/endpoint')
  .catch(error => {
    trackAPIError('/api/endpoint', 500, error.message)
  })
```

---

## Google Analytics 4 Setup

### Viewing Data

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (G-645LCGRT9T)
3. Navigate to:
   - **Reports** → See traffic overview
   - **Explore** → Create custom reports
   - **Realtime** → See current visitors
   - **Events** → View custom events

### Custom Events in GA4

All your custom events appear in:
- **Reports** → **Engagement** → **Events**

View metrics for:
- `sign_up`
- `login`
- `newsletter_signup`
- `waitlist_join`
- `enrichment`
- `brand_recon`
- `button_click`
- `subscription_start`
- `purchase`

### Creating Custom Reports

1. Go to **Explore** in GA4
2. Create a new exploration
3. Add dimensions: `event_name`, `page_path`, `user_type`
4. Add metrics: `event_count`, `users`, `sessions`
5. Apply filters and segments as needed

---

## Troubleshooting

### Events Not Appearing

1. **Check GA4 Real-time Reports** - Events show immediately
2. **Verify Measurement ID** - Should be `G-645LCGRT9T`
3. **Check Browser Console** - Look for errors
4. **Verify Cookie Consent** - User must accept cookies

### Database Errors

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM leads;"

# Check table schema
psql $DATABASE_URL -c "\d leads"

# View recent leads
psql $DATABASE_URL -c "SELECT * FROM leads ORDER BY created_at DESC LIMIT 5;"
```

### Lead Capture Not Working

1. **Check API endpoint** - Visit `/api/leads` in browser
2. **Check database** - Verify tables exist
3. **Check console** - Look for JavaScript errors
4. **Check localStorage** - User might have already submitted

---

## Next Steps

### Integration Opportunities

1. **Email Service Integration**
   - Add Resend, SendGrid, or Mailchimp
   - Send welcome emails on newsletter signup
   - Send notifications to admin on new waitlist signups

2. **CRM Integration**
   - Export leads to HubSpot, Salesforce, or Pipedrive
   - Sync lead data automatically

3. **Advanced Segmentation**
   - Create user cohorts based on behavior
   - A/B test different lead capture strategies
   - Track conversion funnels

4. **Heatmaps & Session Recording**
   - Integrate Hotjar or Microsoft Clarity
   - See exactly how users interact with your site

5. **IP Geolocation**
   - Add MaxMind or IPinfo API
   - Store visitor country/city for targeting

---

## Support

For issues or questions:
- Check [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- Review database schema in `scripts/create_leads_table.sql`
- Check implementation in `src/lib/analytics/`

---

**Last Updated:** 2026-01-12
**Version:** 1.0.0
