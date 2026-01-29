'use client'

import * as React from 'react'
import {useRouter} from 'next/navigation'
import {Command} from 'cmdk'
import {
  Zap,
  Users,
  ScanEye,
  Home,
  Radar,
  User,
  MessageSquare,
  Search,
  Archive,
  Command as CommandIcon,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type CommandItem = {
  id: string
  label: string
  shortcut?: string
  icon: React.ComponentType<{className?: string}>
  action: () => void
  group: 'actions' | 'navigation' | 'support'
}

// =============================================================================
// HOOK
// =============================================================================

export function useCommandMenu() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return {open, setOpen}
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CommandMenu({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const router = useRouter()

  const handleSelect = React.useCallback(
    (callback: () => void) => {
      setOpen(false)
      callback()
    },
    [setOpen]
  )

  const items: CommandItem[] = React.useMemo(
    () => [
      // Actions
      {
        id: 'start-pro',
        label: 'Start Operator ($30/mo)',
        shortcut: '⌘P',
        icon: Zap,
        action: () => {
          window.open(
            'https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00',
            '_blank'
          )
        },
        group: 'actions',
      },
      {
        id: 'demo',
        label: 'Run Demo',
        shortcut: '⌘D',
        icon: Radar,
        action: () => router.push('/enrich'),
        group: 'actions',
      },
      {
        id: 'audit',
        label: 'Request Audit',
        icon: MessageSquare,
        action: () => {
          window.open(
            'https://calendly.com/liam-liamellis/digital-mischief-group',
            '_blank'
          )
        },
        group: 'actions',
      },
      // Navigation
      {
        id: 'home',
        label: 'HQ',
        icon: Home,
        action: () => router.push('/'),
        group: 'navigation',
      },
      {
        id: 'cortex',
        label: 'Cortex Vault',
        icon: Archive,
        action: () => router.push('/cortex'),
        group: 'navigation',
      },
      {
        id: 'loadout',
        label: 'Loadout',
        icon: Zap,
        action: () => router.push('/loadout'),
        group: 'navigation',
      },
      {
        id: 'enrich',
        label: 'Enrich',
        icon: Users,
        action: () => router.push('/enrich'),
        group: 'navigation',
      },
      {
        id: 'observe',
        label: 'Observe',
        icon: ScanEye,
        action: () => router.push('/observe'),
        group: 'navigation',
      },
      {
        id: 'profile',
        label: 'Uplink (Profile)',
        icon: User,
        action: () => router.push('/profile'),
        group: 'navigation',
      },
    ],
    [router]
  )

  const actionItems = items.filter((i) => i.group === 'actions')
  const navItems = items.filter((i) => i.group === 'navigation')

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label='Command Menu'
      className='fixed inset-0 z-[200] flex items-start justify-center pt-24'
    >
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-zinc-950/70 backdrop-blur-[2px]'
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className='w-full max-w-md'>
        <div className='relative mx-4'>
          <div className='relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl'>
            {/* Top trace */}
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent' />
            {/* Micro scanlines */}
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.025)_50%)] bg-[size:100%_4px] opacity-30' />

            {/* Header */}
            <div className='flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/50 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <CommandIcon className='h-4 w-4 text-orange-500' />
                <span className='text-[10px] font-mono uppercase tracking-[0.28em] text-orange-500'>
                  Daedalus Command
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
                <span className='text-[10px] font-mono text-zinc-500'>ACTIVE</span>
              </div>
            </div>

            {/* Search input */}
            <div className='border-b border-zinc-800/50 px-4 py-4'>
              <div className='flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 transition-colors focus-within:border-orange-500/40'>
                <Search className='h-4 w-4 text-zinc-500' />
                <Command.Input
                  placeholder='Type a command or search...'
                  className='flex-1 bg-transparent text-sm font-mono text-white placeholder:text-zinc-600 outline-none'
                />
                <kbd className='rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-[10px] font-mono text-zinc-500'>
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <Command.List className='max-h-[60vh] overflow-y-auto px-3 py-3'>
              <Command.Empty className='py-6 text-center text-sm text-zinc-500'>
                No results found.
              </Command.Empty>

            {/* Actions */}
            <Command.Group
              className='space-y-2'
              heading={
                <div className='flex items-center gap-3 px-2 py-2 text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500'>
                  <span className='text-zinc-500'>Actions</span>
                  <span className='h-px flex-1 border-t border-dashed border-zinc-800/80' />
                </div>
              }
            >
              {actionItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className='group relative flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white data-[selected=true]:border-orange-500/50 data-[selected=true]:bg-orange-500/10 data-[selected=true]:text-white'
                  >
                    <span className='absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-orange-500/70 to-transparent opacity-0 data-[selected=true]:opacity-100 data-[selected=true]:animate-pulse' />
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 group-hover:border-zinc-700 data-[selected=true]:border-orange-500/60'>
                      <Icon className='h-4 w-4 text-orange-400 group-hover:text-orange-300' />
                    </div>
                    <span className='flex-1 text-sm font-medium'>{item.label}</span>
                    {item.shortcut && (
                      <kbd className='rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-mono text-zinc-500'>
                        {item.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Navigation */}
            <Command.Group
              className='mt-4 space-y-2'
              heading={
                <div className='flex items-center gap-3 px-2 py-2 text-[10px] font-mono uppercase tracking-[0.28em] text-zinc-500'>
                  <span className='text-zinc-500'>Navigation</span>
                  <span className='h-px flex-1 border-t border-dashed border-zinc-800/80' />
                </div>
              }
            >
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className='group relative flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white data-[selected=true]:border-orange-500/50 data-[selected=true]:bg-orange-500/10 data-[selected=true]:text-white'
                  >
                    <span className='absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-orange-500/70 to-transparent opacity-0 data-[selected=true]:opacity-100 data-[selected=true]:animate-pulse' />
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/60 group-hover:border-zinc-700 data-[selected=true]:border-orange-500/60'>
                      <Icon className='h-4 w-4 text-orange-400 group-hover:text-orange-300' />
                    </div>
                    <span className='flex-1 text-sm font-medium'>{item.label}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>

            {/* Footer */}
            <div className='flex items-center justify-between border-t border-zinc-800/60 bg-zinc-900/60 px-4 py-3'>
              <div className='flex items-center gap-4 text-[10px] font-mono text-zinc-500'>
                <span className='flex items-center gap-1'>
                  <kbd className='rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-zinc-500'>
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className='flex items-center gap-1'>
                  <kbd className='rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-zinc-500'>
                    ↵
                  </kbd>
                  select
                </span>
              </div>
              <div className='h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse' />
            </div>
          </div>

          {/* HUD corners (inset to respect radius) */}
          <div className='pointer-events-none absolute inset-2'>
            <div className='absolute top-0 left-0 h-3 w-3 border-l-2 border-t-2 border-orange-500/70' />
            <div className='absolute top-0 right-0 h-3 w-3 border-r-2 border-t-2 border-orange-500/70' />
            <div className='absolute bottom-0 left-0 h-3 w-3 border-l-2 border-b-2 border-orange-500/70' />
            <div className='absolute bottom-0 right-0 h-3 w-3 border-r-2 border-b-2 border-orange-500/70' />
          </div>
        </div>
      </div>
    </Command.Dialog>
  )
}

// =============================================================================
// PROVIDER (for layout.tsx)
// =============================================================================

export function CommandMenuProvider({children}: {children: React.ReactNode}) {
  const {open, setOpen} = useCommandMenu()

  return (
    <>
      {children}
      <CommandMenu open={open} setOpen={setOpen} />
    </>
  )
}
