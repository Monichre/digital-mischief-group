'use client'

import {Check} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {UpgradeButton} from './upgrade-button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function PricingPage() {
  return (
    <div className='min-h-screen bg-[#050507] flex flex-col items-center justify-center py-16 px-4'>
      {/* Background */}
      <div className='absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:64px_64px]' />

      <div className='relative z-10 flex flex-col items-center space-y-12 max-w-5xl w-full'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl md:text-5xl font-bold text-white font-mono tracking-tight'>
            PRICING_MATRIX
          </h1>
          <p className='text-zinc-400 max-w-xl mx-auto font-mono'>
            Unlock the full potential of the DMG Intelligence Suite.
          </p>
        </div>

        {/* Cards */}
        <div className='grid gap-8 lg:grid-cols-2 w-full'>
          {/* Free Plan */}
          <Card className='flex flex-col bg-zinc-900/50 border-zinc-800'>
            <CardHeader>
              <CardTitle className='text-white font-mono'>FREE</CardTitle>
              <CardDescription className='font-mono'>
                For individuals just getting started.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
              <div className='text-4xl font-bold text-white'>
                $0
                <span className='text-base font-normal text-zinc-500'>/mo</span>
              </div>
              <ul className='mt-6 space-y-3 text-zinc-300'>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                  Limited Enrichment (3 rows/mo)
                </li>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                  Basic Brand Analysis (1/mo)
                </li>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                  Community Support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                disabled
                variant='outline'
                className='w-full font-mono border-zinc-700 text-zinc-500'
              >
                CURRENT PLAN
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className='flex flex-col border-orange-500/50 bg-zinc-900/80 shadow-lg shadow-orange-500/10 relative overflow-hidden'>
            <div className='absolute top-0 right-0 bg-orange-500 text-black px-4 py-1 text-xs font-bold font-mono'>
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle className='text-white font-mono'>PRO</CardTitle>
              <CardDescription className='font-mono'>
                For power users who need more.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex-1'>
              <div className='text-4xl font-bold text-white'>
                $29
                <span className='text-base font-normal text-zinc-500'>/mo</span>
              </div>
              <ul className='mt-6 space-y-3 text-zinc-300'>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-orange-500 flex-shrink-0' />
                  Unlimited Enrichment
                </li>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-orange-500 flex-shrink-0' />
                  Unlimited Brand Analysis
                </li>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-orange-500 flex-shrink-0' />
                  Deep Research Agent
                </li>
                <li className='flex items-center gap-2 font-mono text-sm'>
                  <Check className='w-4 h-4 text-orange-500 flex-shrink-0' />
                  Priority Support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <div className='w-full'>
                <UpgradeButton />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
