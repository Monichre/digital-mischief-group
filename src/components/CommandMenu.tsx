'use client'

import * as React from 'react'
import {useRouter} from 'next/navigation'
import {Command} from 'cmdk'
import {
  Zap,
  Users,
  ScanEye,
  Telescope,
  Home,
  Radar,
  User,
  MessageSquare,
  Shield,
  Search,
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
        label: 'Start Pro ($30/mo)',
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
        id: 'field-report',
        label: 'Field Reports',
        shortcut: '⌘A',
        icon: Shield,
        action: () => router.push('/field-reports'),
        group: 'actions',
      },
      {
        id: 'intel',
        label: 'Field Reports',
        shortcut: '⌘I',
        icon: Telescope,
        action: () => router.push('/intel'),
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
      className='fixed inset-0 z-[200]'
    >
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-zinc-950/80 backdrop-blur-sm'
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className='fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl'>
        <div className='relative mx-4 bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 overflow-hidden'>
          {/* HUD corners */}
          <div className='absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-orange-500' />
          <div className='absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-orange-500' />
          <div className='absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-orange-500' />
          <div className='absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-orange-500' />

          {/* Header */}
          <div className='flex items-center gap-3 px-4 py-3 border-b border-zinc-800'>
            <CommandIcon className='w-4 h-4 text-orange-500' />
            <span className='text-[10px] text-zinc-500 font-mono tracking-widest'>
              COMMAND_INTERFACE
            </span>
          </div>

          {/* Search input */}
          <div className='flex items-center gap-3 px-4 py-4 border-b border-zinc-800/50'>
            <Search className='w-4 h-4 text-zinc-500' />
            <Command.Input
              placeholder='Type a command or search...'
              className='flex-1 bg-transparent text-white placeholder:text-zinc-600 outline-none font-mono text-sm'
            />
            <kbd className='px-2 py-1 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded'>
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className='max-h-[60vh] overflow-y-auto p-2'>
            <Command.Empty className='py-6 text-center text-sm text-zinc-500'>
              No results found.
            </Command.Empty>

            {/* Actions */}
            <Command.Group
              heading={
                <span className='px-2 py-2 text-[10px] font-mono text-orange-500 tracking-widest'>
                  // ACTIONS
                </span>
              }
            >
              {actionItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className='flex items-center gap-3 px-3 py-3 rounded cursor-pointer data-[selected=true]:bg-orange-500/10 data-[selected=true]:text-white text-zinc-400 hover:text-white transition-colors'
                  >
                    <div className='w-8 h-8 flex items-center justify-center border border-zinc-700 bg-zinc-800 data-[selected=true]:border-orange-500'>
                      <Icon className='w-4 h-4' />
                    </div>
                    <span className='flex-1 text-sm'>{item.label}</span>
                    {item.shortcut && (
                      <kbd className='px-2 py-1 text-[10px] font-mono text-zinc-600 bg-zinc-800 border border-zinc-700 rounded'>
                        {item.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Navigation */}
            <Command.Group
              heading={
                <span className='px-2 py-2 text-[10px] font-mono text-zinc-500 tracking-widest'>
                  // NAVIGATION
                </span>
              }
            >
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item.action)}
                    className='flex items-center gap-3 px-3 py-3 rounded cursor-pointer data-[selected=true]:bg-orange-500/10 data-[selected=true]:text-white text-zinc-400 hover:text-white transition-colors'
                  >
                    <div className='w-8 h-8 flex items-center justify-center border border-zinc-700 bg-zinc-800'>
                      <Icon className='w-4 h-4' />
                    </div>
                    <span className='flex-1 text-sm'>{item.label}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className='flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50'>
            <div className='flex items-center gap-4 text-[10px] font-mono text-zinc-600'>
              <span className='flex items-center gap-1'>
                <kbd className='px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500'>
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500'>
                  ↵
                </kbd>
                select
              </span>
            </div>
            <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse' />
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
