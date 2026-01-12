/**
 * Example page demonstrating analytics implementation
 *
 * This shows how to integrate analytics tracking into a typical marketing page
 */

'use client'

import { LeadCaptureModal } from '@/components/analytics/LeadCaptureModal'
import { trackButtonClick, trackNewsletterSignup } from '@/lib/analytics/events'
import { Button } from '@/components/ui/button'

export default function ExampleAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            AI-Powered Marketing Intelligence
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Extract brand insights, enrich leads, and monitor the web automatically
          </p>

          {/* CTA Button with tracking */}
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              trackButtonClick('hero_cta', 'example_page')
              // Navigate to signup/dashboard
            }}
          >
            Get Started Free
          </Button>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Brand Recon</h3>
            <p className="text-gray-400 mb-4">
              Extract brand identity, colors, fonts, and voice from any website
            </p>
            <Button
              variant="outline"
              onClick={() => {
                trackButtonClick('learn_more_brand_recon', 'features_section')
              }}
            >
              Learn More
            </Button>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Lead Enrichment</h3>
            <p className="text-gray-400 mb-4">
              Enrich CSV leads with company data, funding, and tech stack
            </p>
            <Button
              variant="outline"
              onClick={() => {
                trackButtonClick('learn_more_enrich', 'features_section')
              }}
            >
              Learn More
            </Button>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Web Monitoring</h3>
            <p className="text-gray-400 mb-4">
              Monitor websites for changes and get instant notifications
            </p>
            <Button
              variant="outline"
              onClick={() => {
                trackButtonClick('learn_more_monitors', 'features_section')
              }}
            >
              Learn More
            </Button>
          </div>
        </section>

        {/* Inline Newsletter Signup */}
        <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-8 border border-blue-800/50 mb-16">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-6">
            Get weekly insights on AI, marketing automation, and growth strategies
          </p>
          <form
            className="flex gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const email = (e.target as any).email.value

              // Save to database
              await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  type: 'newsletter',
                  source: 'inline_form',
                }),
              })

              // Track event
              trackNewsletterSignup(email, 'inline_form')

              // Show success message
              alert('Thanks for subscribing!')
              ;(e.target as any).reset()
            }}
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </form>
        </section>

        {/* Documentation Note */}
        <section className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            📚 Analytics Implementation Example
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            This page demonstrates the analytics implementation. Open your browser's DevTools to see:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
            <li>Page view events automatically tracked</li>
            <li>Button click events with context</li>
            <li>Scroll depth tracking (25%, 50%, 75%, 100%)</li>
            <li>Time on page measurement</li>
            <li>Lead capture modals with triggers</li>
          </ul>
          <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-800">
            <code className="text-xs text-green-400">
              // Check Network tab for: gtag, google-analytics
              <br />
              // Check Console for: Analytics events
            </code>
          </div>
        </section>
      </div>

      {/* Lead Capture Modals */}
      {/* Newsletter popup after 30 seconds */}
      <LeadCaptureModal
        type="newsletter"
        trigger="time"
        delayMs={30000}
      />

      {/* Waitlist popup on scroll */}
      <LeadCaptureModal
        type="waitlist"
        feature="Brand Recon"
        trigger="scroll"
      />
    </div>
  )
}
