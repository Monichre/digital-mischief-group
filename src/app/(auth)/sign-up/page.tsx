'use client'

import {useState} from 'react'
import {motion} from 'framer-motion'
import {
  Flame,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {authClient} from '@/platform/auth/client'
import {getSafeCallbackUrl} from '@/lib/core-flow-ux'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const callbackUrl = getSafeCallbackUrl(
    searchParams.get('callbackUrl') || '/workspace'
  )
  const signInHref =
    callbackUrl === '/'
      ? '/sign-in'
      : `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`

  const passwordRequirements = [
    {label: '8+ characters', met: password.length >= 8},
    {label: 'Uppercase', met: /[A-Z]/.test(password)},
    {label: 'Lowercase', met: /[a-z]/.test(password)},
    {label: 'Number', met: /\d/.test(password)},
  ]

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      setError('Please enter your name')
      return
    }

    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!passwordRequirements.every((req) => req.met)) {
      setError('Password does not meet requirements')
      return
    }

    setIsLoading(true)
    setError(null)
    setName(trimmedName)
    setEmail(trimmedEmail)

    try {
      const result = await authClient.signUp.email({
        email: trimmedEmail,
        password,
        name: trimmedName,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to create account')
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
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] px-4 py-12'>
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
            <span>{'// OPERATOR ONBOARDING'}</span>
          </div>
          <div className='flex items-center gap-3 mb-8'>
            <Flame className='w-8 h-8 text-orange-500' />
            <div>
              <h1 className='text-2xl font-bold text-white font-mono'>
                CREATE ACCOUNT
              </h1>
              <p className='text-xs text-zinc-500 font-sans'>
                Set up your operator profile and launch your first missions.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              id='sign-up-error'
              role='alert'
              aria-live='polite'
              className='mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono'
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Name Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-up-name'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <User className='w-3 h-3' />
                AGENT NAME
              </label>
              <input
                id='sign-up-name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Agent Smith'
                autoComplete='name'
                aria-describedby={error ? 'sign-up-error' : undefined}
                disabled={isLoading}
                required
                className='dmg-input-surface w-full rounded-sm px-4 py-3 font-mono text-white outline-none transition-colors placeholder:text-zinc-600'
              />
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-up-email'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <Mail className='w-3 h-3' />
                EMAIL
              </label>
              <input
                id='sign-up-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='agent@dmg.io'
                autoComplete='email'
                aria-describedby={error ? 'sign-up-error' : undefined}
                disabled={isLoading}
                required
                className='dmg-input-surface w-full rounded-sm px-4 py-3 font-mono text-white outline-none transition-colors placeholder:text-zinc-600'
              />
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-up-password'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <Lock className='w-3 h-3' />
                PASSWORD
              </label>
              <div className='relative'>
                <input
                  id='sign-up-password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  autoComplete='new-password'
                  aria-describedby={error ? 'sign-up-error' : undefined}
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
              {/* Password Requirements */}
              <div className='flex flex-wrap gap-2 mt-2'>
                {passwordRequirements.map((req) => (
                  <span
                    key={req.label}
                    className={`text-xs font-mono px-2 py-1 border ${
                      req.met
                        ? 'border-green-500/50 text-green-400 bg-green-500/10'
                        : 'border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {req.met && <Check className='w-3 h-3 inline mr-1' />}
                    {req.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className='space-y-2'>
              <label
                htmlFor='sign-up-confirm-password'
                className='text-xs text-zinc-500 font-mono flex items-center gap-2'
              >
                <Lock className='w-3 h-3' />
                CONFIRM PASSWORD
              </label>
              <input
                id='sign-up-confirm-password'
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='••••••••'
                autoComplete='new-password'
                aria-describedby={error ? 'sign-up-error' : undefined}
                disabled={isLoading}
                required
                className={`w-full rounded-sm text-white placeholder:text-zinc-600 px-4 py-3 outline-none transition-colors font-mono ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'dmg-input-surface border-green-500'
                      : 'dmg-input-surface border-red-500'
                    : 'dmg-input-surface focus:border-orange-500'
                }`}
              />
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={
                isLoading ||
                !passwordsMatch ||
                !passwordRequirements.every((r) => r.met)
              }
              className='btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-orange-500 px-4 py-3 font-mono font-bold text-zinc-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  INITIALIZING...
                </>
              ) : (
                <>
                  CREATE AGENT
                  <ArrowRight className='w-5 h-5' />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-zinc-800 text-center'>
            <p className='text-sm text-zinc-500 font-sans'>
              EXISTING AGENT?{' '}
              <Link
                href={signInHref}
                className='text-orange-500 hover:text-orange-400 transition-colors'
              >
                Sign in
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
