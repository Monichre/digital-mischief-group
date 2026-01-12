# Analytics Quick Reference

## Common Tasks

### Add Newsletter Popup to Homepage

```tsx
import { LeadCaptureModal } from '@/components/analytics/LeadCaptureModal'

export default function HomePage() {
  return (
    <>
      <YourContent />
      <LeadCaptureModal type="newsletter" trigger="time" delayMs={30000} />
    </>
  )
}
```

### Track Button Clicks

```tsx
import { trackButtonClick } from '@/lib/analytics/events'

<button onClick={() => trackButtonClick('upgrade_cta', 'pricing_page')}>
  Upgrade Now
</button>
```

### Track Feature Usage

```tsx
import { trackEnrichment } from '@/lib/analytics/events'

async function handleEnrich(data: any[]) {
  trackEnrichment('start', data.length)
  const result = await enrichData(data)
  trackEnrichment('complete', result.length)
}
```

### Track Authentication

```tsx
import { trackSignUp, trackLogin } from '@/lib/analytics/events'

// After successful signup
trackSignUp('email')

// After successful login
trackLogin('google')
```

### Track Subscription Events

```tsx
import { trackSubscriptionStart, trackSubscriptionComplete } from '@/lib/analytics/events'

// When user clicks "Subscribe"
trackSubscriptionStart('pro', 29.99)

// After successful payment
trackSubscriptionComplete('pro', 29.99, transactionId)
```

---

## Database Queries

### Get All Newsletter Signups

```sql
SELECT email, name, created_at
FROM leads
WHERE type = 'newsletter'
ORDER BY created_at DESC;
```

### Get Conversion Rate

```sql
SELECT
  (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') as total_leads,
  (SELECT COUNT(*) FROM page_views WHERE viewed_at >= NOW() - INTERVAL '30 days') as total_views,
  ROUND(
    (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days')::numeric /
    NULLIF((SELECT COUNT(*) FROM page_views WHERE viewed_at >= NOW() - INTERVAL '30 days'), 0) * 100,
    2
  ) as conversion_rate_percent;
```

### Get Top Landing Pages for Conversions

```sql
SELECT landing_page, COUNT(*) as leads
FROM leads
WHERE landing_page IS NOT NULL
GROUP BY landing_page
ORDER BY leads DESC
LIMIT 10;
```

### Get Leads by Source

```sql
SELECT source, COUNT(*) as count
FROM leads
GROUP BY source
ORDER BY count DESC;
```

---

## API Endpoints

### Capture Lead (POST)

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "type": "newsletter",
    "source": "homepage"
  }'
```

### Get Leads (GET)

```bash
# All leads
curl http://localhost:3000/api/leads

# Filter by type
curl http://localhost:3000/api/leads?type=newsletter

# Limit results
curl http://localhost:3000/api/leads?limit=50
```

### Get Analytics Stats (GET)

```bash
# Last 30 days
curl http://localhost:3000/api/analytics/stats?days=30

# Last 7 days
curl http://localhost:3000/api/analytics/stats?days=7
```

---

## GA4 Event Names

| Event Name | Description | Parameters |
|------------|-------------|------------|
| `sign_up` | User registration | `method` |
| `login` | User login | `method` |
| `newsletter_signup` | Newsletter subscription | `source`, `has_email` |
| `waitlist_join` | Waitlist signup | `feature`, `has_email` |
| `enrichment` | Lead enrichment action | `action`, `row_count` |
| `brand_recon` | Brand analysis action | `action`, `has_url` |
| `scout_action` | Scout operation | `action`, `scout_id` |
| `button_click` | Button interaction | `button_name`, `button_location` |
| `link_click` | Link interaction | `link_text`, `link_url`, `is_external` |
| `begin_checkout` | Start subscription flow | `plan_name`, `price` |
| `purchase` | Completed subscription | `transaction_id`, `value`, `plan_name` |
| `page_view` | Page navigation | `page_path`, `page_title` |
| `scroll_depth` | Scroll milestone | `depth_percentage` |
| `time_on_page` | Page exit | `time_spent_seconds` |

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-645LCGRT9T

# Database (already configured)
DATABASE_URL=your_postgres_url
```

---

## File Structure

```
src/
├── components/analytics/
│   ├── GoogleAnalytics.tsx        # GA4 initialization
│   ├── AnalyticsProvider.tsx      # User identification & auto-tracking
│   ├── LeadCaptureModal.tsx       # Lead capture UI
│   └── CookieConsent.tsx          # GDPR/CCPA consent banner
├── lib/analytics/
│   ├── events.ts                  # Event tracking functions
│   └── hooks.ts                   # React hooks for tracking
└── app/api/
    ├── leads/route.ts             # Lead capture API
    └── analytics/stats/route.ts   # Analytics dashboard API

scripts/
└── create_leads_table.sql         # Database schema

docs/
├── ANALYTICS_SETUP.md             # Full documentation
└── ANALYTICS_QUICK_REFERENCE.md   # This file
```

---

## Checklist for New Pages

When creating a new page, consider adding:

- [ ] Lead capture modal (newsletter or waitlist)
- [ ] Track primary CTA button clicks
- [ ] Track feature-specific events
- [ ] Track form submissions
- [ ] Track error states

---

## Best Practices

1. **Track user intent, not just actions**
   - ❌ `trackEvent('click')`
   - ✅ `trackButtonClick('upgrade_cta', 'pricing_page')`

2. **Include context in events**
   - ❌ `trackEnrichment('complete')`
   - ✅ `trackEnrichment('complete', rowCount)`

3. **Track errors for debugging**
   ```tsx
   try {
     await riskyOperation()
   } catch (error) {
     trackError('operation_name', error.message)
   }
   ```

4. **Use consistent naming**
   - Use snake_case for event names: `newsletter_signup`
   - Use descriptive button names: `hero_cta`, `pricing_upgrade`

5. **Don't over-track**
   - Track meaningful interactions, not every hover or scroll
   - Focus on conversion events and user intent

---

## Troubleshooting

### Events not showing in GA4?
1. Check Real-time reports (events show immediately)
2. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
3. Check browser console for errors
4. Ensure user accepted cookie consent

### Lead capture not working?
1. Run database migration: `psql $DATABASE_URL -f scripts/create_leads_table.sql`
2. Check `/api/leads` returns valid response
3. Verify database connection
4. Check browser console for errors

### Cookie consent not showing?
1. Clear localStorage: `localStorage.removeItem('cookie_consent')`
2. Refresh page
3. Should appear after 2 seconds

---

## Support Resources

- [Full Documentation](./ANALYTICS_SETUP.md)
- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Better Auth Docs](https://www.better-auth.com/docs)

---

**Version:** 1.0.0
**Last Updated:** 2026-01-12
