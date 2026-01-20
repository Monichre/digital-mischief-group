'use client'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Loader2, Zap} from 'lucide-react'
import {authClient} from '@/platform/auth/client'

export function UpgradeButton({className}: {className?: string}) {
  const [loading, setLoading] = useState(false)
  const {data: session} = authClient.useSession()

  const handleUpgrade = async () => {
    // Check if user is authenticated before calling checkout
    if (!session?.user) {
      window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('Checkout error:', data)
        throw new Error('Failed to create checkout session')
      }

      const {url} = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full bg-orange-500 hover:bg-orange-400 text-white font-mono font-bold ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          PROCESSING...
        </>
      ) : (
        <>
          <Zap className='w-4 h-4 mr-2' />
          UPGRADE TO PRO
        </>
      )}
    </Button>
  )
}
