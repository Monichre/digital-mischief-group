'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trackNewsletterSignup, trackWaitlistJoin } from '@/lib/analytics/events'

interface LeadCaptureModalProps {
  type?: 'newsletter' | 'waitlist'
  feature?: string
  trigger?: 'time' | 'scroll' | 'exit' | 'manual'
  delayMs?: number
}

export function LeadCaptureModal({
  type = 'newsletter',
  feature,
  trigger = 'time',
  delayMs = 30000, // 30 seconds default
}: LeadCaptureModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Check if user already submitted
    const hasSubmitted = localStorage.getItem(`lead_capture_${type}_submitted`)
    if (hasSubmitted) return

    // Time-based trigger
    if (trigger === 'time') {
      const timer = setTimeout(() => setIsOpen(true), delayMs)
      return () => clearTimeout(timer)
    }

    // Scroll-based trigger (75% down page)
    if (trigger === 'scroll') {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrollPercent > 75) {
          setIsOpen(true)
          window.removeEventListener('scroll', handleScroll)
        }
      }
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }

    // Exit intent trigger
    if (trigger === 'exit') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          setIsOpen(true)
          document.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
      document.addEventListener('mouseleave', handleMouseLeave)
      return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [trigger, delayMs, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save to database
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          type,
          feature,
          source: trigger,
          metadata: {
            page: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
          },
        }),
      })

      if (response.ok) {
        // Track event
        if (type === 'newsletter') {
          trackNewsletterSignup(email, trigger)
        } else {
          trackWaitlistJoin(email, feature)
        }

        // Mark as submitted
        localStorage.setItem(`lead_capture_${type}_submitted`, 'true')
        setSubmitted(true)

        // Close after 3 seconds
        setTimeout(() => setIsOpen(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {submitted
              ? '✨ Success!'
              : type === 'newsletter'
              ? 'Stay in the Loop'
              : `Join ${feature || 'the'} Waitlist`}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {submitted
              ? "We'll be in touch soon!"
              : type === 'newsletter'
              ? 'Get exclusive updates, tips, and early access to new features.'
              : `Be the first to know when ${feature || 'this feature'} launches.`}
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Name (optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : type === 'newsletter' ? 'Subscribe' : 'Join Waitlist'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg">🎉 You're on the list!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
