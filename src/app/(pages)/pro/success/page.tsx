'use client'

import Link from 'next/link'
import {Check, Zap, ArrowRight, User, Radar} from 'lucide-react'
import {motion} from 'framer-motion'

export default function ProSuccessPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono flex items-center justify-center'>
      {/* Background */}
      <div className='fixed inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none' />
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.1) 0%, transparent 50%)',
        }}
      />

      <div className='relative z-10 max-w-2xl mx-auto px-6 py-16 text-center'>
        {/* Success Icon */}
        <motion.div
          initial={{scale: 0}}
          animate={{scale: 1}}
          transition={{type: 'spring', delay: 0.2}}
          className='w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center'
        >
          <Check className='w-12 h-12 text-emerald-500' />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3}}
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 border border-emerald-500/30 bg-emerald-500/5 rounded-full'>
            <Zap className='w-4 h-4 text-emerald-500' />
            <span className='text-[10px] text-emerald-500 uppercase tracking-widest'>
              // PAYMENT CONFIRMED
            </span>
          </div>

          <h1 className='text-display-md mb-6'>
            Welcome to <span className='text-orange-500'>OPERATOR</span>
          </h1>

          <p className='text-body-xl text-zinc-400 mb-12'>
            You now have full access to the DMG Arsenal.
          </p>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.5}}
          className='border border-zinc-800 bg-zinc-900/50 p-8 mb-8 text-left'
        >
          {/* HUD corners */}
          <div className='absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-orange-500/50' />
          <div className='absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-orange-500/50' />
          <div className='absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-orange-500/50' />
          <div className='absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-orange-500/50' />

          <h2 className='text-lg font-bold text-orange-500 mb-6'>
            // NEXT STEPS
          </h2>

          <div className='space-y-6'>
            {/* Step 1 */}
            <div className='flex items-start gap-4'>
              <div className='w-10 h-10 flex-shrink-0 flex items-center justify-center border border-zinc-700 bg-zinc-800 text-orange-500 font-bold'>
                01
              </div>
              <div>
                <h3 className='font-bold text-white flex items-center gap-2'>
                  <User className='w-4 h-4 text-orange-500' />
                  Create Your Uplink Account
                </h3>
                <p className='text-sm text-zinc-500 mt-1'>
                  Sign up to access your personalized dashboard and save your
                  work.
                </p>
                <Link
                  href='/sign-up'
                  className='inline-flex items-center gap-2 mt-2 text-sm text-orange-500 hover:text-orange-400'
                >
                  Create Account <ArrowRight className='w-3 h-3' />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className='flex items-start gap-4'>
              <div className='w-10 h-10 flex-shrink-0 flex items-center justify-center border border-zinc-700 bg-zinc-800 text-orange-500 font-bold'>
                02
              </div>
              <div>
                <h3 className='font-bold text-white flex items-center gap-2'>
                  <Radar className='w-4 h-4 text-orange-500' />
                  Access the Intel Suite
                </h3>
                <p className='text-sm text-zinc-500 mt-1'>
                  Run unlimited enrichment, research missions, and brand
                  analysis.
                </p>
                <Link
                  href='/enrich'
                  className='inline-flex items-center gap-2 mt-2 text-sm text-orange-500 hover:text-orange-400'
                >
                  Launch Enrich <ArrowRight className='w-3 h-3' />
                </Link>
              </div>
            </div>

          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.7}}
        >
          <Link
            href='/enrich'
            className='inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all'
          >
            <Zap className='w-5 h-5' />
            <span>START USING OPERATOR</span>
            <ArrowRight className='w-5 h-5' />
          </Link>

          <p className='text-xs text-zinc-600 mt-6'>
            Need help? Email{' '}
            <a
              href='mailto:support@digitalmischief.group'
              className='text-orange-500 hover:underline'
            >
              support@digitalmischief.group
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
