'use client'

import {useState} from 'react'
import {motion} from 'framer-motion'
import {
  Flame,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {authClient} from '@/platform/auth/client'
import {getSafeCallbackUrl} from '@/lib/core-flow-ux'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'))
  const signUpHref =
    callbackUrl === '/'
      ? '/sign-up'
      : `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    if (!password) {
      setError('Please enter your password')
      return
    }

    setEmail(trimmedEmail)
    setIsLoading(true)

    try {
      const result = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Invalid credentials')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-4 py-16'>
      {/* Background Grid */}
      <div className='absolute inset-0 dmg-grid-bg opacity-60' />

      {/* Gradient Orbs */}
      <div className='absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl' />

      <Link
        href='/'
        className='absolute left-6 top-6 z-20 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-orange-500'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to HQ
      </Link>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className='relative w-full max-w-md'
      >
        {/* Card */}
        <div className='dmg-auth-card relative rounded-sm p-8 md:p-10'>
          {/* Corner Accents */}
          <div className='absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-orange-500' />
          <div className='absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-orange-500' />
          <div className='absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-orange-500' />
          <div className='absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-orange-500' />

          {/* Header */}
          <div className='dmg-chip mb-5'>
            <Flame className='w-3 h-3 text-orange-500' />
            <span>{'// SECURE UPLINK'}</span>
          </div>
          <div className='flex items-center gap-3 mb-8'>
            <Flame className='w-8 h-8 text-orange-500' />
            <div>
              <h1 className='text-2xl font-bold text-white font-mono'>
                SIGN IN
              </h1>
              <p className='text-xs text-zinc-500 font-sans'>
                Access your operator workspace.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              id='sign-in-error'
              role='alert'
              aria-live='polite'
              className='mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono'
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-in-email'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <Mail className='w-3 h-3' />
                EMAIL
              </label>
              <input
                id='sign-in-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='agent@dmg.io'
                autoComplete='email'
                aria-describedby={error ? 'sign-in-error' : undefined}
                disabled={isLoading}
                required
                className='dmg-input-surface w-full rounded-sm px-4 py-3 font-mono text-white outline-none transition-colors placeholder:text-zinc-600'
              />
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-in-password'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <Lock className='w-3 h-3' />
                PASSWORD
              </label>
              <div className='relative'>
                <input
                  id='sign-in-password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  autoComplete='current-password'
                  aria-describedby={error ? 'sign-in-error' : undefined}
                  disabled={isLoading}
                  required
                  className='dmg-input-surface w-full rounded-sm px-4 py-3 pr-12 font-mono text-white outline-none transition-colors placeholder:text-zinc-600'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  disabled={isLoading}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='btn-glow flex w-full items-center justify-center gap-2 rounded-sm bg-orange-500 px-4 py-3 font-mono font-bold text-zinc-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIATE SESSION
                  <ArrowRight className='w-5 h-5' />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-zinc-800 text-center'>
            <p className='text-sm text-zinc-500 font-sans'>
              NO CREDENTIALS?{' '}
              <Link
                href={signUpHref}
                className='text-orange-500 hover:text-orange-400 transition-colors'
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Scan Line Effect */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px]' />
        </div>
      </motion.div>
    </div>
  )
}
