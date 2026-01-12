'use client'

import {useProStatus} from '@/hooks/use-pro-status'
import {Button} from '@/components/ui/button'
import {Lock, Zap} from 'lucide-react'
import Link from 'next/link'
import {Skeleton} from '@/components/ui/skeleton'
import {authClient} from '@/lib/auth-client'

export function ProGate({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const {isPro, isLoading} = useProStatus()
  const {data: session, isPending: sessionLoading} = authClient.useSession()

  // Show loading state while checking auth/pro status
  if (isLoading || sessionLoading) {
    return (
      <div className='space-y-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50'>
        <Skeleton className='h-8 w-1/3 bg-zinc-800' />
        <Skeleton className='h-32 w-full bg-zinc-800' />
      </div>
    )
  }

  // If not logged in, prompt to sign in
  if (!session?.user) {
    return (
      fallback || (
        <div className='border border-zinc-700 bg-zinc-900/80 p-6 rounded-md flex flex-col md:flex-row items-center gap-4 text-center md:text-left'>
          <div className='p-3 bg-zinc-800 rounded-full border border-zinc-700'>
            <Lock className='text-zinc-400 h-6 w-6' />
          </div>
          <div className='flex-1'>
            <h3 className='font-semibold text-zinc-100 text-lg font-mono'>
              [ AUTHENTICATION REQUIRED ]
            </h3>
            <p className='text-zinc-400 text-sm'>
              Sign in to access this intel module.
            </p>
          </div>
          <Button asChild className='whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-mono'>
            <Link href={`/sign-in?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}>
              SIGN IN
            </Link>
          </Button>
        </div>
      )
    )
  }

  // If logged in and pro, show children
  if (isPro) {
    return <>{children}</>
  }

  // Logged in but not pro - show upgrade prompt
  return (
    fallback || (
      <div className='border border-orange-500/30 bg-zinc-900/80 p-6 rounded-md flex flex-col md:flex-row items-center gap-4 text-center md:text-left'>
        <div className='p-3 bg-orange-500/10 rounded-full border border-orange-500/30'>
          <Zap className='text-orange-500 h-6 w-6' />
        </div>
        <div className='flex-1'>
          <h3 className='font-semibold text-zinc-100 text-lg font-mono'>
            [ OPERATOR CLEARANCE REQUIRED ]
          </h3>
          <p className='text-zinc-400 text-sm'>
            Upgrade to Operator tier to unlock unlimited access to this tool and more.
          </p>
        </div>
        <Button asChild className='whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-mono'>
          <Link href='/loadout'>UPGRADE</Link>
        </Button>
      </div>
    )
  )
}
