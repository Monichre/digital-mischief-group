'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {authClient} from '@/platform/auth/client'
import {cn} from '@/lib/utils'

type AuthLinksProps = {
  className?: string
  linkClassName?: string
  ctaClassName?: string
}

export function AuthLinks({
  className,
  linkClassName,
  ctaClassName,
}: AuthLinksProps) {
  const router = useRouter()
  const {data: session, isPending} = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseLinkClass = cn(
    'text-xs text-zinc-400 hover:text-white transition-colors',
    linkClassName
  )
  const baseCtaClass = cn(
    'px-3 py-1.5 border border-zinc-700 text-xs text-zinc-300 hover:border-orange-500/60 hover:text-orange-500 transition-colors',
    ctaClassName
  )

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await authClient.signOut()
      router.push('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  if (!mounted || isPending) return null

  if (!session?.user) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Link href='/sign-in' className={baseLinkClass}>
          SIGN IN
        </Link>
        <Link href='/sign-up' className={baseCtaClass}>
          SIGN UP
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Link href='/profile' className={baseLinkClass}>
        PROFILE
      </Link>
      <button
        type='button'
        onClick={handleSignOut}
        disabled={signingOut}
        className={baseCtaClass}
      >
        {signingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
      </button>
    </div>
  )
}
