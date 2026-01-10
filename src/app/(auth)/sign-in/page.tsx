'use client'

import {useState} from 'react'
import {motion} from 'framer-motion'
import {Flame, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff} from 'lucide-react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {authClient} from '@/lib/auth-client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Invalid credentials')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#050507] relative overflow-hidden'>
      {/* Background Grid */}
      <div className='absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:64px_64px]' />

      {/* Gradient Orbs */}
      <div className='absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl' />
      <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl' />

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        className='relative w-full max-w-md mx-4'
      >
        {/* Card */}
        <div className='bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-8 relative'>
          {/* Corner Accents */}
          <div className='absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-orange-500' />
          <div className='absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-orange-500' />
          <div className='absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-orange-500' />
          <div className='absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-orange-500' />

          {/* Header */}
          <div className='flex items-center gap-3 mb-8'>
            <Flame className='w-8 h-8 text-orange-500' />
            <div>
              <h1 className='text-2xl font-bold text-white font-mono'>
                SIGN IN
              </h1>
              <p className='text-xs text-zinc-500 font-mono'>ACCESS_GRANTED</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              className='mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono'
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='space-y-2'>
              <label className='text-xs text-zinc-500 font-mono flex items-center gap-2'>
                <Mail className='w-3 h-3' />
                EMAIL
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='agent@dmg.io'
                required
                className='w-full bg-zinc-800/50 border border-zinc-700 focus:border-orange-500 text-white placeholder:text-zinc-600 px-4 py-3 outline-none transition-colors font-mono'
              />
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <label className='text-xs text-zinc-500 font-mono flex items-center gap-2'>
                <Lock className='w-3 h-3' />
                PASSWORD
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                  className='w-full bg-zinc-800/50 border border-zinc-700 focus:border-orange-500 text-white placeholder:text-zinc-600 px-4 py-3 pr-12 outline-none transition-colors font-mono'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
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
              className='w-full bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 transition-colors flex items-center justify-center gap-2 font-mono'
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
            <p className='text-zinc-500 text-sm font-mono'>
              NO CREDENTIALS?{' '}
              <Link
                href='/sign-up'
                className='text-orange-500 hover:text-orange-400 transition-colors'
              >
                CREATE_ACCOUNT
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
