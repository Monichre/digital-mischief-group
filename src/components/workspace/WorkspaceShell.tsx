'use client'

import type React from 'react'
import {useEffect, useRef, useState} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import useSWR from 'swr'
import {
  ArrowRight,
  ArrowUp,
  Binoculars,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleDot,
  Code2,
  File,
  FileText,
  Flame,
  FolderOpen,
  Globe2,
  Heart,
  ImageIcon,
  Loader2,
  MemoryStick,
  PanelLeft,
  Paperclip,
  Plus,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  WandSparkles,
  Moon,
  X,
} from 'lucide-react'
import {
  WORKSPACE_SKILLS,
  type WorkspaceSkillId,
} from '@/daedalus/agent/workspace/config'
import type {
  KnowledgeSearchResult,
  KnowledgeSource,
} from '@/daedalus/agent/knowledge/types'

type WorkspaceView = 'new' | 'search' | 'skills' | 'files' | 'memory'
type WorkspaceTheme = 'dark' | 'light'

type WorkspaceTask = {
  id: string
  skill: WorkspaceSkillId
  primitive: 'enrich' | 'agent' | 'extract' | 'scout' | 'observe'
  title: string
  prompt: string
  status: string
  target_href: string
  created_at: string
}

type SearchPayload = {
  tasks: WorkspaceTask[]
  sources: Array<{
    id: string
    source_type: KnowledgeSource['source_type']
    title: string
    summary: string | null
    status: string
    created_at: string
  }>
  knowledge: KnowledgeSearchResult[]
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url)
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Request failed')
  return data as T
}

const iconBySkill: Record<WorkspaceSkillId, React.ComponentType<{className?: string}>> = {
  research: BrainCircuit,
  enrich: Sparkles,
  'brand-recon': Radar,
  sentinels: Binoculars,
  observe: CircleDot,
  'weaponize-browser': Globe2,
}

const navItems: Array<{
  id: WorkspaceView
  label: string
  icon: React.ComponentType<{className?: string}>
}> = [
  {id: 'new', label: 'New task', icon: Plus},
  {id: 'search', label: 'Search', icon: Search},
  {id: 'skills', label: 'Arsenal', icon: WandSparkles},
  {id: 'files', label: 'Files', icon: FolderOpen},
  {id: 'memory', label: 'Memory', icon: MemoryStick},
]

function shortDate(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('en', {month: 'short', day: 'numeric'}).format(date)
}

function bytesLabel(value: number | null) {
  if (!value) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: WorkspaceTheme
  onToggle: () => void
}) {
  const lightMode = theme === 'light'

  return (
    <button
      type='button'
      aria-label={`Switch to ${lightMode ? 'dark' : 'light'} mode`}
      aria-pressed={lightMode}
      onClick={onToggle}
      className={`workspace-theme-toggle inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium shadow-sm transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
        lightMode
          ? 'border-[#c9d0c9] bg-white/90 text-[#455048] shadow-[0_4px_14px_rgba(24,32,27,0.08)] hover:border-[#9ebf98] hover:text-[#18201b]'
          : 'border-white/10 bg-[#111312]/90 text-zinc-400 shadow-black/20 hover:border-white/20 hover:text-zinc-100'
      }`}
    >
      {lightMode ? <Moon className='h-3.5 w-3.5' /> : <Sun className='h-3.5 w-3.5' />}
      <span className='hidden sm:inline'>{lightMode ? 'Dark' : 'Light'}</span>
    </button>
  )
}

export function WorkspaceShell({
  user,
}: {
  user: {name: string | null; email: string}
}) {
  const router = useRouter()
  const [view, setView] = useState<WorkspaceView>('new')
  const [theme, setTheme] = useState<WorkspaceTheme>('dark')
  const [selectedSkill, setSelectedSkill] =
    useState<WorkspaceSkillId>('research')
  const [prompt, setPrompt] = useState('')
  const [launching, setLaunching] = useState(false)
  const [launchError, setLaunchError] = useState<string | null>(null)
  const {data: taskData, mutate: mutateTasks} = useSWR<{tasks: WorkspaceTask[]}>(
    '/api/workspace/tasks',
    fetcher
  )
  const {data: sourceData, mutate: mutateSources} = useSWR<{
    sources: KnowledgeSource[]
  }>('/api/knowledge', fetcher)

  const tasks = taskData?.tasks || []
  const sources = sourceData?.sources || []
  const firstName = user.name?.trim().split(/\s+/)[0] || user.email.split('@')[0]

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem('dmg-workspace-theme')
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme)
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    try {
      window.localStorage.setItem('dmg-workspace-theme', nextTheme)
    } catch {
      // Keep the in-session preference even when it cannot be persisted.
    }
    setTheme(nextTheme)
  }

  const launchTask = async () => {
    const nextPrompt = prompt.trim()
    if (!nextPrompt || launching) return

    setLaunching(true)
    setLaunchError(null)
    try {
      const response = await fetch('/api/workspace/tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({skill: selectedSkill, prompt: nextPrompt}),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.task?.target_href) {
        throw new Error(data?.error || 'The task could not be launched')
      }
      await mutateTasks()
      router.push(data.task.target_href)
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'The task could not be launched')
      setLaunching(false)
    }
  }

  return (
    <div data-workspace-theme={theme} className={`workspace-shell min-h-screen font-sans ${theme === 'light' ? 'bg-[#f4f7f1] text-[#18201b]' : 'bg-[#070708] text-zinc-200'} ${view === 'memory' ? 'h-screen overflow-hidden' : 'lg:h-screen lg:overflow-hidden'}`}>
      <style jsx global>{`
        .dmg-menu-toggle {
          display: none !important;
        }

        .workspace-shell { color-scheme: dark; }
        .workspace-shell[data-workspace-theme='light'] { color-scheme: light; }
        .workspace-shell[data-workspace-theme='light'] .workspace-sidebar,
        .workspace-shell[data-workspace-theme='light'] .workspace-header,
        .workspace-shell[data-workspace-theme='light'] .workspace-mobile-nav,
        .workspace-shell[data-workspace-theme='light'] .workspace-memory-return,
        .workspace-shell[data-workspace-theme='light'] .workspace-memory-tabs {
          border-color: rgba(24, 32, 27, 0.13) !important;
          background: rgba(248, 250, 246, 0.94) !important;
        }
        .workspace-shell[data-workspace-theme='light'] .workspace-canvas-grid {
          opacity: 0.6;
        }
        .workspace-shell[data-workspace-theme='light'] .workspace-canvas-grid > div:first-child {
          background-image: linear-gradient(to right, rgba(24, 32, 27, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(24, 32, 27, 0.08) 1px, transparent 1px) !important;
        }
        .workspace-shell[data-workspace-theme='light'] .workspace-canvas-glow {
          background: rgba(185, 249, 52, 0.18) !important;
        }
        .workspace-shell[data-workspace-theme='light'] .workspace-surface {
          border-color: rgba(24, 32, 27, 0.13) !important;
          background: rgba(255, 255, 255, 0.86) !important;
          box-shadow: 0 18px 50px rgba(24, 32, 27, 0.08) !important;
        }
        .workspace-shell[data-workspace-theme='light'] .text-white,
        .workspace-shell[data-workspace-theme='light'] .text-zinc-100,
        .workspace-shell[data-workspace-theme='light'] .text-zinc-200 { color: #18201b !important; }
        .workspace-shell[data-workspace-theme='light'] .text-zinc-300,
        .workspace-shell[data-workspace-theme='light'] .text-zinc-400 { color: #455048 !important; }
        .workspace-shell[data-workspace-theme='light'] .text-zinc-500,
        .workspace-shell[data-workspace-theme='light'] .text-zinc-600 { color: #68716a !important; }
        .workspace-shell[data-workspace-theme='light'] .text-zinc-700,
        .workspace-shell[data-workspace-theme='light'] .text-zinc-800 { color: #68716a !important; }
        .workspace-shell[data-workspace-theme='light'] .text-orange-300,
        .workspace-shell[data-workspace-theme='light'] .text-orange-400 { color: #a74613 !important; }
        .workspace-shell[data-workspace-theme='light'] .text-orange-500 { color: #c2410c !important; }
        .workspace-shell[data-workspace-theme='light'] [class*='border-white/'] { border-color: rgba(24, 32, 27, 0.12) !important; }
      `}</style>

      <aside className={`workspace-sidebar fixed inset-y-0 left-0 z-40 hidden w-[286px] flex-col border-r border-white/10 bg-[#09090a] ${view === 'memory' ? 'lg:hidden' : 'lg:flex'}`}>
        <button
          type='button'
          onClick={() => setView('new')}
          className='flex h-16 items-center gap-3 border-b border-white/10 px-5 text-left transition-colors hover:bg-white/[0.03]'
        >
          <span className='flex h-7 w-7 items-center justify-center rounded-md bg-orange-500 text-zinc-950'>
            <Flame className='h-4 w-4' />
          </span>
          <span>
            <span className='block text-sm font-semibold text-white'>Daedalus</span>
            <span className='block font-mono text-[9px] tracking-[0.18em] text-zinc-600'>DMG SUPERCOMPUTER</span>
          </span>
        </button>

        <nav aria-label='Workspace navigation' className='space-y-1 p-3'>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setView(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-white/[0.07] text-white'
                    : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-orange-500' : ''}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className='mt-3 flex min-h-0 flex-1 flex-col border-t border-white/10 px-3 pt-4'>
          <div className='mb-2 flex items-center justify-between px-2'>
            <span className='font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600'>Tasks</span>
            <span className='font-mono text-[9px] text-zinc-700'>{tasks.length}</span>
          </div>
          <div className='min-h-0 flex-1 space-y-1 overflow-y-auto pb-4'>
            {tasks.length === 0 ? (
              <p className='px-2 py-4 text-xs leading-5 text-zinc-700'>Launched missions will appear here.</p>
            ) : (
              tasks.map((task) => {
                const Icon = iconBySkill[task.skill]
                return (
                  <Link
                    key={task.id}
                    href={task.target_href}
                    className='group flex items-start gap-2 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.04]'
                  >
                    <Icon className='mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-orange-500' />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-xs text-zinc-400 group-hover:text-zinc-200'>{task.title}</span>
                      <span className='mt-1 block font-mono text-[9px] uppercase text-zinc-700'>{shortDate(task.created_at)}</span>
                    </span>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        <div className='border-t border-white/10 p-3'>
          <Link
            href='/profile'
            aria-label='Open profile and billing'
            className='flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-white/[0.04]'
          >
            <span className='flex h-8 w-8 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 font-mono text-xs uppercase text-orange-400'>
              {firstName.slice(0, 2)}
            </span>
            <span className='min-w-0'>
              <span className='block truncate text-xs text-zinc-300'>{user.name || firstName}</span>
              <span className='block truncate text-[10px] text-zinc-600'>{user.email}</span>
            </span>
          </Link>
        </div>
      </aside>

      <div className={view === 'memory' ? 'h-screen' : 'lg:ml-[286px] lg:flex lg:h-screen lg:flex-col'}>
        {view === 'memory' ? (
          <header className='pointer-events-none fixed inset-x-0 top-0 z-30 h-16'>
            <button
              type='button'
              aria-label='Return to workspace'
              onClick={() => setView('new')}
              className='workspace-memory-return pointer-events-auto absolute left-4 top-3.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#111312]/80 text-zinc-600 backdrop-blur-md transition-colors hover:border-white/20 hover:text-zinc-200'
            >
              <PanelLeft className='h-3.5 w-3.5' />
            </button>

            <div className='pointer-events-auto absolute right-4 top-3.5'>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>

            <div role='tablist' aria-label='Workspace mode' className='workspace-memory-tabs pointer-events-auto absolute left-1/2 top-2.5 flex -translate-x-1/2 items-center rounded-xl border border-white/8 bg-[#111312]/90 p-1 shadow-xl shadow-black/20 backdrop-blur-md'>
              <button
                type='button'
                role='tab'
                aria-selected={false}
                onClick={() => setView('new')}
                className='inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200'
              >
                <Sparkles className='h-3.5 w-3.5' /> Skills
              </button>
              <button
                type='button'
                role='tab'
                aria-selected
                className='inline-flex items-center gap-2 rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs text-zinc-100 shadow-sm'
              >
                <CircleDot className='h-3.5 w-3.5' /> Memory
              </button>
            </div>
          </header>
        ) : (
          <header className='workspace-header sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#09090a]/95 px-4 backdrop-blur-xl md:px-6 lg:relative'>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => setView('new')}
                className='flex items-center gap-2 text-sm font-medium text-white lg:hidden'
              >
                <Flame className='h-4 w-4 text-orange-500' />
                Daedalus
              </button>
              <span className='hidden text-xs text-zinc-600 lg:block'>Workspace</span>
            </div>

            <div role='tablist' aria-label='Workspace mode' className='flex items-center rounded-lg bg-white/[0.04] p-1'>
              <button
                type='button'
                role='tab'
                aria-selected
                onClick={() => setView('new')}
                className='rounded-md bg-white/[0.08] px-3 py-1.5 text-xs text-white transition-colors'
              >
                Skills
              </button>
              <button
                type='button'
                role='tab'
                aria-selected={false}
                onClick={() => setView('memory')}
                className='rounded-md px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-300'
              >
                Memory
              </button>
            </div>

            <div className='flex items-center gap-3'>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Link href='/' className='text-xs text-zinc-600 transition-colors hover:text-orange-500'>HQ</Link>
            </div>
          </header>
        )}

        <main className={view === 'memory' ? 'relative h-screen overflow-hidden' : 'relative min-h-[calc(100vh-4rem)] flex-1 overflow-y-auto pb-24 lg:min-h-0 lg:pb-0'}>
          {view !== 'memory' && (
            <div className='workspace-canvas-grid pointer-events-none fixed inset-0 left-0 opacity-60 lg:left-[286px]'>
              <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px]' />
              <div className='workspace-canvas-glow absolute left-1/2 top-1/3 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-orange-500/[0.045] blur-[120px]' />
            </div>
          )}

          {view === 'new' && (
            <NewTaskView
              firstName={firstName}
              prompt={prompt}
              setPrompt={setPrompt}
              selectedSkill={selectedSkill}
              setSelectedSkill={setSelectedSkill}
              launching={launching}
              error={launchError}
              onLaunch={launchTask}
            />
          )}
          {view === 'skills' && <SkillsView onSelect={(skillId) => {
            setSelectedSkill(skillId)
            setView('new')
          }} />}
          {view === 'memory' && (
            <MemoryView sources={sources} mutateSources={mutateSources} lightMode={theme === 'light'} />
          )}
          {view === 'files' && (
            <FilesView sources={sources} mutateSources={mutateSources} />
          )}
          {view === 'search' && <SearchView />}
        </main>
      </div>

      <nav aria-label='Mobile workspace navigation' className={`workspace-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#09090a]/95 px-1 py-2 backdrop-blur-xl lg:hidden ${view === 'memory' ? 'hidden' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              type='button'
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 text-[9px] ${active ? 'text-orange-500' : 'text-zinc-600'}`}
            >
              <Icon className='h-4 w-4' />
              {item.label.replace('New ', '')}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function NewTaskView({
  firstName,
  prompt,
  setPrompt,
  selectedSkill,
  setSelectedSkill,
  launching,
  error,
  onLaunch,
}: {
  firstName: string
  prompt: string
  setPrompt: (value: string) => void
  selectedSkill: WorkspaceSkillId
  setSelectedSkill: (value: WorkspaceSkillId) => void
  launching: boolean
  error: string | null
  onLaunch: () => void
}) {
  const skill = WORKSPACE_SKILLS.find((item) => item.id === selectedSkill) || WORKSPACE_SKILLS[0]

  return (
    <section className='relative z-10 mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-5 py-14 md:px-10 lg:py-20'>
      <div className='mx-auto w-full max-w-3xl'>
        <div className='mb-10 text-center'>
          <span className='mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/[0.06] px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-orange-400'>
            <CircleDot className='h-3 w-3' /> ALL SYSTEMS NOMINAL
          </span>
          <h1 className='text-balance text-3xl font-medium tracking-tight text-white md:text-5xl'>
            {firstName}, what are we building today?
          </h1>
          <p className='mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500'>
            One command surface for research, reconnaissance, monitoring, and extraction.
          </p>
        </div>

        <div className='workspace-surface overflow-hidden rounded-2xl border border-white/10 bg-[#111113]/95 shadow-2xl shadow-black/30'>
          <textarea
            aria-label='Task prompt'
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onLaunch()
              }
            }}
            placeholder={skill.placeholder}
            className='min-h-32 w-full resize-none bg-transparent px-5 py-5 text-base leading-7 text-zinc-100 outline-none placeholder:text-zinc-700'
          />

          <div className='border-t border-white/8 p-3'>
            <div className='mb-3 flex flex-wrap gap-2'>
              {WORKSPACE_SKILLS.map((item) => {
                const Icon = iconBySkill[item.id]
                const active = item.id === selectedSkill
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => setSelectedSkill(item.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                      active
                        ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                        : 'border-white/8 text-zinc-600 hover:border-white/15 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className='h-3 w-3' />
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className='flex items-center justify-between gap-3'>
              <div className='min-w-0'>
                <span className='block font-mono text-[9px] tracking-[0.16em] text-zinc-700'>
                  {skill.eyebrow} PROTOCOL
                </span>
                <span className='hidden truncate text-[11px] text-zinc-600 sm:block'>{skill.description}</span>
              </div>
              <button
                type='button'
                onClick={onLaunch}
                disabled={!prompt.trim() || launching}
                className='inline-flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600'
              >
                {launching ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <ArrowRight className='h-3.5 w-3.5' />}
                Launch
              </button>
            </div>
          </div>
        </div>

        {error && <p role='alert' className='mt-3 text-center text-xs text-red-400'>{error}</p>}

        <div className='mt-8 grid gap-2'>
          {skill.examples.slice(0, 3).map((example) => (
            <button
              key={example}
              type='button'
              onClick={() => setPrompt(example)}
              className='group flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-600 transition-colors hover:bg-white/[0.03] hover:text-zinc-300'
            >
              <ChevronRight className='h-3.5 w-3.5 text-zinc-800 transition-colors group-hover:text-orange-500' />
              {example}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkillsView({onSelect}: {onSelect: (skillId: WorkspaceSkillId) => void}) {
  return (
    <section className='relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-10'>
      <div className='mb-8'>
        <span className='font-mono text-[10px] tracking-[0.2em] text-orange-500'>{'// ARSENAL'}</span>
        <h1 className='mt-2 text-3xl font-medium text-white'>Skills</h1>
        <p className='mt-2 max-w-2xl text-sm text-zinc-500'>Every skill maps to an existing Daedalus primitive. No duplicate engines, no mystery meat.</p>
      </div>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {WORKSPACE_SKILLS.map((skill, index) => {
          const Icon = iconBySkill[skill.id]
          return (
            <button
              key={skill.id}
              type='button'
              onClick={() => onSelect(skill.id)}
              className='group rounded-xl border border-white/10 bg-white/[0.025] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-orange-500/30 hover:bg-orange-500/[0.04]'
            >
              <div className='mb-8 flex items-center justify-between'>
                <span className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-zinc-500 group-hover:border-orange-500/30 group-hover:text-orange-400'>
                  <Icon className='h-4 w-4' />
                </span>
                <span className='font-mono text-[9px] text-zinc-700'>0{index + 1}</span>
              </div>
              <span className='font-mono text-[9px] tracking-[0.18em] text-orange-500/70'>{skill.eyebrow}</span>
              <h2 className='mt-1 text-base font-medium text-zinc-200'>{skill.label}</h2>
              <p className='mt-2 text-sm leading-6 text-zinc-600'>{skill.description}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function MemoryView({
  sources,
  mutateSources,
  lightMode,
}: {
  sources: KnowledgeSource[]
  mutateSources: () => Promise<unknown>
  lightMode: boolean
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const readyCount = sources.filter((source) => source.status === 'ready').length
  const chunkCount = sources.reduce((total, source) => total + Number(source.chunk_count || 0), 0)
  const orbitItems = [
    {label: 'Files', Icon: FolderOpen, position: 'left-[42%] top-[28%]'},
    {label: 'Code', Icon: Code2, position: 'left-[64%] top-[34%]'},
    {label: 'Images', Icon: ImageIcon, position: 'left-[26%] top-[44%]'},
    {label: 'People', Icon: UserRound, position: 'left-[70%] top-[57%]'},
    {label: 'Private sources', Icon: ShieldCheck, position: 'left-[28%] top-[62%]'},
    {label: 'Favorites', Icon: Heart, position: 'left-[49%] top-[73%]'},
  ]

  const ingest = async () => {
    if ((!value.trim() && !file) || loading) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let response: Response
      if (file) {
        const form = new FormData()
        form.set('file', file)
        response = await fetch('/api/knowledge', {method: 'POST', body: form})
      } else {
        const raw = value.trim()
        const isUrl = /^https?:\/\//i.test(raw)
        response = await fetch('/api/knowledge', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(
            isUrl
              ? {type: 'url', url: raw}
              : {type: 'text', text: raw}
          ),
        })
      }

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.source?.title) {
        throw new Error(data?.error || 'Knowledge could not be integrated')
      }

      setValue('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setSuccess(`${data.source.title} is now part of Delphi.`)
      await mutateSources()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Knowledge could not be integrated')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`relative isolate h-full min-h-[560px] overflow-hidden ${lightMode ? 'bg-[#f4f7f1] text-[#18201b]' : 'bg-[#080a09] text-zinc-100'}`}>
      <div
        aria-hidden
        className={`absolute inset-0 bg-repeat ${lightMode ? 'opacity-45 mix-blend-multiply' : 'opacity-80'}`}
        style={{backgroundImage: "url('/daedalus/delphi-grid.webp')", backgroundSize: '520px 520px'}}
      />

      <div className='absolute left-1/2 top-[53%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 sm:top-[55%] sm:h-[520px] sm:w-[520px]'>
        <Image
          src='/daedalus/delphi-core.webp'
          alt=''
          fill
          priority
          sizes='(max-width: 640px) 420px, 520px'
          className={`pointer-events-none scale-[1.06] select-none object-cover ${lightMode ? 'brightness-[0.92] contrast-[1.08] drop-shadow-[0_22px_45px_rgba(89,111,43,0.24)]' : 'opacity-95'}`}
        />

        <div className='absolute left-1/2 top-[13%] z-10 -translate-x-1/2 text-center sm:top-[18%]'>
          <h1 className={`whitespace-nowrap text-[21px] font-medium tracking-[-0.025em] sm:text-[24px] ${lightMode ? 'text-[#18201b]' : 'text-zinc-100'}`}>Delphi Sentience</h1>
          <p className={`mt-1 whitespace-nowrap text-sm ${lightMode ? 'text-[#68716a]' : 'text-zinc-500'}`}>Learn from every chat</p>
          <span className='sr-only'>{readyCount} sources and {chunkCount} chunks indexed</span>
        </div>

        {orbitItems.map(({label, Icon, position}) => (
          <button
            key={label}
            type='button'
            aria-label={label}
            title={label}
            onClick={() => inputRef.current?.focus()}
            className={`absolute z-10 flex h-7 w-7 items-center justify-center rounded-md border shadow-lg backdrop-blur-sm transition-[border-color,background-color,color] duration-150 ${lightMode ? 'border-[#c9d0c9] bg-white/80 text-[#68716a] shadow-[0_8px_18px_rgba(24,32,27,0.1)] hover:border-[#a5d642] hover:bg-[#fbfff4] hover:text-[#456c11]' : 'border-white/10 bg-[#111312]/90 text-zinc-500 shadow-black/20 hover:border-[#b8ff2c]/25 hover:text-zinc-200'} ${position}`}
          >
            <Icon className='h-3.5 w-3.5' />
          </button>
        ))}

        <button
          type='button'
          aria-label='Add knowledge to Delphi Sentience'
          onClick={() => inputRef.current?.focus()}
          className={`absolute left-1/2 top-1/2 z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#78a51a]/70 focus-visible:ring-offset-4 ${lightMode ? 'focus-visible:ring-offset-[#f4f7f1]' : 'focus-visible:ring-offset-[#080a09]'}`}
        />
      </div>

      <div className='absolute inset-x-3 bottom-3 z-20 mx-auto max-w-[620px] sm:inset-x-5 sm:bottom-5'>
        {error && (
          <p role='alert' className={`mx-auto mb-2 w-fit rounded-full border px-3 py-1.5 text-xs backdrop-blur-md ${lightMode ? 'border-red-200 bg-red-50/90 text-red-700' : 'border-red-400/15 bg-red-950/70 text-red-300'}`}>
            {error}
          </p>
        )}
        {success && (
          <p role='status' className={`mx-auto mb-2 flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur-md ${lightMode ? 'border-[#b6d98b] bg-[#f4f9eb]/95 text-[#40610e]' : 'border-[#b8ff2c]/15 bg-[#10160d]/85 text-[#c7ff35]'}`}>
            <Check className='h-3.5 w-3.5' /> {success}
          </p>
        )}

        <div className={`rounded-2xl border p-2 backdrop-blur-xl transition-[border-color,box-shadow] duration-150 ${lightMode ? 'border-[#8ab2aa] bg-white/90 shadow-[0_18px_70px_rgba(24,32,27,0.14)] focus-within:border-[#267d71]' : 'border-[#24796f] bg-[#101211]/95 shadow-[0_18px_70px_rgba(0,0,0,0.5)] focus-within:border-[#39a597]'}`}>
          <div className='flex items-center gap-1'>
            <input
              ref={fileRef}
              type='file'
              className='hidden'
              accept='.pdf,.docx,.txt,.md,.markdown,.csv,.json,.xml,.jpg,.jpeg,.png,.webp,.gif'
              onChange={(event) => {
                const selected = event.target.files?.[0] || null
                setFile(selected)
                if (selected) setValue('')
              }}
            />
            <button
              type='button'
              aria-label='Attach a source'
              onClick={() => fileRef.current?.click()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color] duration-150 ${lightMode ? 'text-[#68716a] hover:bg-[#e9eee8] hover:text-[#18201b]' : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200'}`}
            >
              <Paperclip className='h-4 w-4' />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                if (file) setFile(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void ingest()
                }
              }}
              placeholder={file ? file.name : 'Add text, paste a URL or YouTube link…'}
              className={`h-10 min-w-0 flex-1 resize-none overflow-hidden whitespace-nowrap bg-transparent px-1 py-2.5 text-[13px] leading-5 outline-none sm:text-sm ${lightMode ? 'text-[#18201b] placeholder:text-[#8b958e]' : 'text-zinc-200 placeholder:text-zinc-600'}`}
            />
            <button
              type='button'
              aria-label='Integrate'
              onClick={ingest}
              disabled={(!value.trim() && !file) || loading}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-[background-color,color] duration-150 disabled:cursor-not-allowed disabled:opacity-80 ${lightMode ? 'bg-[#267d71] text-white hover:bg-[#1f695f] disabled:bg-[#267d71] disabled:text-white' : 'bg-[#3a887d] text-[#07110f] hover:bg-[#4aa093] disabled:bg-[#3a887d] disabled:text-[#07110f]'}`}
            >
              {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ArrowUp className='h-4 w-4' />}
            </button>
          </div>

          <div className={`flex min-h-5 items-center justify-between gap-3 px-1 pt-1 text-[10px] ${lightMode ? 'text-[#68716a]' : 'text-zinc-600'}`}>
            {file ? (
              <span className={`inline-flex min-w-0 items-center gap-1.5 ${lightMode ? 'text-[#455048]' : 'text-zinc-400'}`}>
                <File className='h-3 w-3 shrink-0 text-[#b8ff2c]' />
                <span className='truncate'>{file.name}</span>
                <button type='button' aria-label='Remove file' onClick={() => setFile(null)} className={`shrink-0 ${lightMode ? 'text-[#68716a] hover:text-[#18201b]' : 'text-zinc-600 hover:text-zinc-200'}`}>
                  <X className='h-3 w-3' />
                </button>
              </span>
            ) : (
              <>
                <span className='sm:hidden'>PDF, DOCX, images &amp; links</span>
                <span className='hidden sm:inline'>PDF, DOCX, text, images, URLs &amp; YouTube</span>
              </>
            )}
            <span className='hidden shrink-0 sm:inline'>Private · vector indexed</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function FilesView({
  sources,
  mutateSources,
}: {
  sources: KnowledgeSource[]
  mutateSources: () => Promise<unknown>
}) {
  const files = sources.filter((source) => source.source_type === 'file')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const remove = async (source: KnowledgeSource) => {
    if (!window.confirm(`Remove ${source.title} from Delphi?`)) return
    setDeletingId(source.id)
    try {
      const response = await fetch(`/api/knowledge?id=${encodeURIComponent(source.id)}`, {method: 'DELETE'})
      if (!response.ok) throw new Error('Delete failed')
      await mutateSources()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className='relative z-10 mx-auto max-w-6xl px-5 py-10 md:px-10'>
      <div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <span className='font-mono text-[10px] tracking-[0.2em] text-orange-500'>{'// PRIVATE SOURCE REGISTRY'}</span>
          <h1 className='mt-2 text-3xl font-medium text-white'>Files</h1>
          <p className='mt-2 text-sm text-zinc-500'>Private originals in Blob; normalized knowledge in Neon.</p>
        </div>
        <span className='font-mono text-[10px] text-zinc-700'>{files.length} FILES</span>
      </div>

      <div className='overflow-hidden rounded-xl border border-white/10'>
        <div className='hidden grid-cols-[1fr_120px_100px_100px] gap-4 border-b border-white/8 bg-white/[0.025] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-700 md:grid'>
          <span>Name</span><span>Type</span><span>Size</span><span>Status</span>
        </div>
        {files.map((source) => (
          <div key={source.id} className='flex items-center gap-3 border-b border-white/8 px-4 py-4 last:border-b-0 md:grid md:grid-cols-[1fr_120px_100px_100px] md:gap-4'>
            <div className='flex min-w-0 items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.03]'><FileText className='h-4 w-4 text-orange-500' /></span>
              <div className='min-w-0'>
                <p className='truncate text-sm text-zinc-300'>{source.file_name || source.title}</p>
                <p className='mt-1 truncate text-[10px] text-zinc-700'>{source.chunk_count} chunks · {shortDate(source.created_at)}</p>
              </div>
            </div>
            <span className='hidden text-xs text-zinc-600 md:block'>{source.mime_type || 'unknown'}</span>
            <span className='hidden text-xs text-zinc-600 md:block'>{bytesLabel(Number(source.size_bytes))}</span>
            <div className='ml-auto flex items-center justify-end gap-2 md:ml-0'>
              {source.status === 'ready' && source.blob_pathname && (
                <Link href={`/api/knowledge/files/${source.id}`} className='rounded-md border border-white/10 px-2 py-1 text-[10px] text-zinc-500 hover:text-white'>Open</Link>
              )}
              <button type='button' aria-label={`Delete ${source.title}`} onClick={() => remove(source)} disabled={deletingId === source.id} className='p-1 text-zinc-700 hover:text-red-400'>
                {deletingId === source.id ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Trash2 className='h-3.5 w-3.5' />}
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && <div className='px-6 py-20 text-center text-sm text-zinc-700'>No private files have been integrated yet.</div>}
      </div>
    </section>
  )
}

function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchPayload>({
    tasks: [],
    sources: [],
    knowledge: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults({tasks: [], sources: [], knowledge: []})
      setError(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/workspace/search?q=${encodeURIComponent(trimmed)}`, {signal: controller.signal})
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || 'Search failed')
        setResults(data as SearchPayload)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setResults({tasks: [], sources: [], knowledge: []})
          setError(error instanceof Error ? error.message : 'Search failed')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const total = results.tasks.length + results.sources.length + results.knowledge.length

  return (
    <section className='relative z-10 mx-auto max-w-5xl px-5 py-10 md:px-10'>
      <span className='font-mono text-[10px] tracking-[0.2em] text-orange-500'>{'// GLOBAL RETRIEVAL'}</span>
      <h1 className='mt-2 text-3xl font-medium text-white'>Search</h1>
      <div className='relative mt-8'>
        <Search className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700' />
        <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder='Search missions and memory…' className='w-full rounded-xl border border-white/10 bg-white/[0.03] py-4 pl-11 pr-12 text-sm text-zinc-200 outline-none focus:border-orange-500/30' />
        {loading && <Loader2 className='absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-500' />}
      </div>
      {error && <p role='alert' className='mt-3 text-xs text-red-400'>{error}</p>}

      <div className='mt-8 space-y-8'>
        {results.tasks.length > 0 && (
          <div>
            <h2 className='mb-3 font-mono text-[10px] tracking-[0.16em] text-zinc-700'>TASKS</h2>
            <div className='space-y-2'>{results.tasks.map((task) => <Link key={task.id} href={task.target_href} className='flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-4 hover:border-orange-500/20'><SourceIcon type='text' /><div className='min-w-0'><p className='truncate text-sm text-zinc-300'>{task.title}</p><p className='mt-1 truncate text-xs text-zinc-700'>{task.prompt}</p></div></Link>)}</div>
          </div>
        )}
        {results.knowledge.length > 0 && (
          <div>
            <h2 className='mb-3 font-mono text-[10px] tracking-[0.16em] text-zinc-700'>KNOWLEDGE HITS</h2>
            <div className='space-y-2'>
              {results.knowledge.map((result) => (
                <div key={result.id} className='flex items-start gap-3 rounded-lg border border-orange-500/10 bg-orange-500/[0.025] p-4'>
                  <SourceIcon type={result.source_type} />
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between gap-3'>
                      <p className='truncate text-sm text-zinc-300'>{result.source_title}</p>
                      {typeof result.similarity === 'number' && (
                        <span className='shrink-0 font-mono text-[9px] text-orange-500/70'>
                          {Math.round(result.similarity * 100)}% MATCH
                        </span>
                      )}
                    </div>
                    <p className='mt-1 line-clamp-3 text-xs leading-5 text-zinc-600'>{result.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {results.sources.length > 0 && (
          <div>
            <h2 className='mb-3 font-mono text-[10px] tracking-[0.16em] text-zinc-700'>MEMORY</h2>
            <div className='space-y-2'>{results.sources.map((source) => <div key={source.id} className='flex items-start gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-4'><SourceIcon type={source.source_type} /><div><p className='text-sm text-zinc-300'>{source.title}</p><p className='mt-1 line-clamp-2 text-xs leading-5 text-zinc-600'>{source.summary}</p></div></div>)}</div>
          </div>
        )}
        {query.trim() && !loading && total === 0 && <p className='py-16 text-center text-sm text-zinc-700'>No matching tasks or memory.</p>}
      </div>
    </section>
  )
}

function SourceIcon({type}: {type: KnowledgeSource['source_type']}) {
  const Icon = type === 'url' ? Globe2 : type === 'file' ? FileText : File
  return <Icon className='mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500' />
}
