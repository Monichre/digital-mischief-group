'use client'

import type React from 'react'

import {useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {motion, AnimatePresence} from 'framer-motion'
import {
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Cpu,
  Database,
  Wifi,
  ChevronRight,
  Target,
  ArrowLeft,
  Sparkles,
  FileText,
  Workflow,
  Users,
  Brain,
  Bot,
} from 'lucide-react'
import {cn} from '@/lib/utils'
import {PageTransition} from '@/components/military/PageTransition'
import {HoloGlobe} from '@/components/military/HoloGlobe'
import {Magnetic, ScrollReveal} from '@/components/scroll-animations'
import {AgentSandbox} from '@/features/war-games/agent-lab'
import {PromptLab} from '@/features/war-games/prompt-lab'
import {DocumentLab} from '@/features/war-games/document-lab/DocumentLab'

type MissionId =
  | 'agent-sandbox'
  | 'prompt-sandbox'
  | 'pdf-analysis'
  | 'document-pipeline'
  | 'enrich-profile'

type Mission = {
  id: MissionId
  title: string
  classification: string
  description: string
  color: string
  icon: React.ComponentType<{className?: string}>
  primaryModel: string
  cooldown: string
  tokens: string
}

type ActivityItem = {
  time: string
  mission: string
  status: 'success' | 'warning' | 'info'
  detail: string
}

const DAILY_LIMIT = 10

const MISSIONS: Mission[] = [
  {
    id: 'agent-sandbox',
    title: 'Agent Sandbox',
    classification: 'TACTICAL',
    description:
      'Route support requests across specialized agents and stream live reasoning.',
    color: 'orange',
    icon: Target,
    primaryModel: 'Claude 3.5 Sonnet',
    cooldown: '30s',
    tokens: '1K / 2K',
  },
  {
    id: 'prompt-sandbox',
    title: 'Prompt Sandbox',
    classification: 'EXPERIMENTAL',
    description:
      'Few-shot prompt evaluation with rapid comparisons and saved variants.',
    color: 'cyan',
    icon: Sparkles,
    primaryModel: 'Claude 3.5 Sonnet',
    cooldown: '30s',
    tokens: '1K / 2K',
  },
  {
    id: 'pdf-analysis',
    title: 'PDF Analysis',
    classification: 'INTELLIGENCE',
    description:
      'Upload a PDF and interrogate it with native file-aware inference.',
    color: 'green',
    icon: FileText,
    primaryModel: 'GPT-4o',
    cooldown: '45s',
    tokens: '1K / 2K',
  },
  {
    id: 'document-pipeline',
    title: 'Document Pipeline',
    classification: 'OPERATIONS',
    description:
      'Structured extraction and transformation for business docs and forms.',
    color: 'purple',
    icon: Workflow,
    primaryModel: 'Claude 3.5 Sonnet',
    cooldown: '45s',
    tokens: '1K / 2K',
  },
  {
    id: 'enrich-profile',
    title: 'Enrich Profile',
    classification: 'AUGMENTATION',
    description: 'Enhance profiles with tags, categories, and career guidance.',
    color: 'amber',
    icon: Users,
    primaryModel: 'Claude 3.5 Sonnet',
    cooldown: '30s',
    tokens: '1K / 2K',
  },
]

const SYSTEM_STATUS = {
  neural: {status: 'ONLINE', health: 98},
  firewall: {status: 'ACTIVE', health: 100},
  encryption: {status: 'AES-256', health: 100},
  uplink: {status: 'STABLE', health: 94},
}

const MODULES = [
  {
    id: 'cortex',
    name: 'CORTEX MODULE',
    status: 'ACTIVE',
    latency: '42ms',
    load: '65%',
    detail: 'Real-time orchestration mesh for multi-LLM routing.',
    icon: Brain,
  },
  {
    id: 'sentience',
    name: 'SENTIENCE MODULE',
    status: 'STABLE',
    latency: '57ms',
    load: '48%',
    detail: 'Self-healing runtime that adapts prompts and safety rails.',
    icon: Bot,
  },
]

const GLOBAL_NODES = [
  {id: 1, name: 'US-EAST', status: 'online', latency: 12},
  {id: 2, name: 'EU-WEST', status: 'online', latency: 45},
  {id: 3, name: 'ASIA-PAC', status: 'online', latency: 89},
  {id: 4, name: 'SA-PRIME', status: 'degraded', latency: 156},
]

const SYSTEM_EVENTS: ActivityItem[] = [
  {
    time: '00:42:17Z',
    mission: 'Network',
    status: 'warning',
    detail: 'Firewall blocked 23 intrusion attempts',
  },
  {
    time: '00:38:52Z',
    mission: 'Neural Core',
    status: 'success',
    detail: 'LLM orchestration warm cache primed',
  },
  {
    time: '00:35:11Z',
    mission: 'Storage',
    status: 'info',
    detail: 'Backup protocols initiated',
  },
  {
    time: '00:31:44Z',
    mission: 'Diagnostics',
    status: 'success',
    detail: 'System diagnostics passed',
  },
]

const ThreatGauge = ({level}: {level: number}) => {
  const labels = ['MINIMAL', 'LOW', 'ELEVATED', 'HIGH', 'CRITICAL']
  const colors = ['emerald', 'emerald', 'yellow', 'orange', 'red']

  return (
    <div className='bg-black/40 border border-stone-900 p-4'>
      <div className='text-[10px] text-stone-500 tracking-widest mb-3'>
        THREAT_LEVEL
      </div>
      <div className='flex items-center gap-2 mb-2'>
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{scaleY: 0}}
            animate={{scaleY: 1}}
            transition={{delay: i * 0.08}}
            className={cn(
              'flex-1 h-8 origin-bottom',
              i <= level
                ? i <= 2
                  ? 'bg-emerald-500'
                  : i <= 3
                  ? 'bg-yellow-500'
                  : i <= 4
                  ? 'bg-orange-500'
                  : 'bg-red-500'
                : 'bg-stone-800'
            )}
          />
        ))}
      </div>
      <div
        className={cn(
          'text-sm font-bold tracking-widest',
          colors[level - 1] === 'emerald'
            ? 'text-emerald-500'
            : colors[level - 1] === 'yellow'
            ? 'text-yellow-500'
            : colors[level - 1] === 'orange'
            ? 'text-orange-500'
            : 'text-red-500'
        )}
      >
        {labels[level - 1]}
      </div>
    </div>
  )
}

const SystemHealthBar = ({
  label,
  health,
  status,
}: {
  label: string
  health: number
  status: string
}) => (
  <div className='flex items-center gap-4 py-2 border-b border-stone-900 last:border-0'>
    <div className='w-24 text-[10px] text-stone-500 tracking-widest'>
      {label}
    </div>
    <div className='flex-1 h-2 bg-stone-900 overflow-hidden'>
      <motion.div
        initial={{width: 0}}
        animate={{width: `${health}%`}}
        transition={{duration: 1}}
        className={cn(
          'h-full',
          health > 90
            ? 'bg-emerald-500'
            : health > 70
            ? 'bg-yellow-500'
            : 'bg-red-500'
        )}
      />
    </div>
    <div className='w-16 text-right text-xs text-emerald-600'>{status}</div>
  </div>
)

const UsageIndicator = ({
  remaining,
  limit,
}: {
  remaining: number
  limit: number
}) => {
  const percent = Math.max(0, Math.min(100, (remaining / limit) * 100))
  return (
    <div className='flex items-center gap-3 text-xs text-stone-400'>
      <div className='font-bold tracking-widest text-orange-400'>
        {remaining}/{limit} MISSIONS
      </div>
      <div className='flex-1 h-2 bg-stone-900 w-32'>
        <div
          className={cn(
            'h-full transition-all',
            percent > 50
              ? 'bg-emerald-500'
              : percent > 20
              ? 'bg-orange-500'
              : 'bg-red-500'
          )}
          style={{width: `${percent}%`}}
        />
      </div>
      <div className='text-[10px] uppercase tracking-widest'>Free Tier</div>
    </div>
  )
}

const MissionCard = ({
  mission,
  onSelect,
}: {
  mission: Mission
  onSelect: () => void
}) => {
  const Icon = mission.icon
  return (
    <button
      onClick={onSelect}
      className='group relative p-4 border border-white/5 bg-zinc-900/40 hover:border-orange-500/50 transition-colors text-left'
    >
      <div className='absolute top-0 left-0 w-3 h-3 border-l border-t border-orange-500/0 group-hover:border-orange-500 transition-colors' />
      <div className='absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/0 group-hover:border-orange-500 transition-colors' />
      <div className='text-[10px] text-stone-500 tracking-widest mb-3'>
        {mission.classification}
      </div>
      <div className='flex items-start gap-3 mb-3'>
        <div className='w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-orange-500/50 transition-colors'>
          <Icon className='w-5 h-5 text-stone-400 group-hover:text-orange-500 transition-colors' />
        </div>
        <div>
          <div className='text-lg font-bold text-white tracking-tight'>
            {mission.title}
          </div>
          <p className='text-xs text-stone-500 leading-relaxed'>
            {mission.description}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-3 text-[10px] text-stone-500'>
        <span className='px-2 py-1 border border-white/10 uppercase tracking-widest'>
          {mission.primaryModel}
        </span>
        <span className='px-2 py-1 border border-white/10 uppercase tracking-widest'>
          Cooldown {mission.cooldown}
        </span>
        <span className='px-2 py-1 border border-white/10 uppercase tracking-widest'>
          Tokens {mission.tokens}
        </span>
      </div>
    </button>
  )
}

const ActivityFeed = ({items}: {items: ActivityItem[]}) => (
  <div className='bg-black/40 border border-stone-900 p-4 h-full'>
    <div className='text-[10px] text-stone-500 tracking-widest mb-4'>
      ACTIVITY_FEED
    </div>
    <div className='space-y-3 max-h-96 overflow-y-auto pr-1'>
      {items.map((item, idx) => (
        <motion.div
          key={`${item.time}-${idx}`}
          initial={{opacity: 0, x: -10}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: idx * 0.05}}
          className='flex items-start gap-3 border-b border-stone-900 pb-3 last:border-0'
        >
          {item.status === 'success' && (
            <CheckCircle size={14} className='text-emerald-500 mt-0.5' />
          )}
          {item.status === 'warning' && (
            <AlertTriangle size={14} className='text-orange-500 mt-0.5' />
          )}
          {item.status === 'info' && (
            <Clock size={14} className='text-cyan-500 mt-0.5' />
          )}
          <div className='flex-1'>
            <div className='text-xs text-white flex items-center gap-2'>
              <span className='tracking-tight'>{item.mission}</span>
              <span className='text-[10px] text-stone-500'>{item.time}</span>
            </div>
            <div className='text-[12px] text-stone-400 leading-relaxed'>
              {item.detail}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)

const ModuleCard = ({
  name,
  status,
  latency,
  load,
  detail,
  icon: Icon,
}: {
  name: string
  status: string
  latency: string
  load: string
  detail: string
  icon: React.ComponentType<{className?: string}>
}) => (
  <div className='border border-white/5 bg-zinc-900/40 p-3 flex gap-3 items-start'>
    <div className='w-9 h-9 border border-white/10 flex items-center justify-center'>
      <Icon className='w-4 h-4 text-orange-400' />
    </div>
    <div className='flex-1 space-y-1'>
      <div className='flex items-center justify-between text-xs text-white font-semibold'>
        <span>{name}</span>
        <span className='text-[10px] text-emerald-400 tracking-widest'>
          {status}
        </span>
      </div>
      <div className='flex items-center gap-3 text-[10px] text-stone-500 uppercase tracking-widest'>
        <span>Latency {latency}</span>
        <span>Load {load}</span>
      </div>
      <p className='text-[12px] text-stone-400 leading-relaxed'>{detail}</p>
    </div>
  </div>
)

const StatPill = ({label, value}: {label: string; value: string}) => (
  <div className='flex flex-col gap-1 border border-white/10 bg-black/30 px-3 py-2'>
    <span className='text-[10px] text-stone-500 tracking-widest'>{label}</span>
    <span className='text-sm font-semibold text-white'>{value}</span>
  </div>
)

const PhaseList = ({
  phases,
}: {
  phases: Array<{
    name: string
    detail: string
    status: 'ready' | 'active' | 'done'
  }>
}) => (
  <div className='border border-white/10 bg-black/20 backdrop-blur-sm p-3 space-y-3'>
    <div className='text-[10px] text-stone-500 tracking-widest'>
      MISSION PHASES
    </div>
    <div className='space-y-2'>
      {phases.map((phase, idx) => (
        <div key={phase.name} className='flex items-start gap-3'>
          <div
            className={cn(
              'w-2 h-2 mt-1 rounded-full',
              phase.status === 'done'
                ? 'bg-emerald-500'
                : phase.status === 'active'
                ? 'bg-orange-400 animate-pulse'
                : 'bg-stone-700'
            )}
          />
          <div className='flex-1'>
            <div className='text-xs text-white font-semibold flex items-center gap-2'>
              <span>{idx + 1}.</span>
              <span>{phase.name}</span>
            </div>
            <p className='text-[12px] text-stone-400 leading-relaxed'>
              {phase.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

const CardShell = ({
  title,
  kicker,
  actions,
  children,
}: {
  title: string
  kicker?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className='bg-zinc-900/60 border border-white/10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] p-4 space-y-3 rounded'>
    <div className='flex items-start justify-between gap-3'>
      <div>
        {kicker && (
          <div className='text-[10px] text-orange-400 tracking-[0.3em] mb-1'>
            {kicker}
          </div>
        )}
        <h2 className='text-xl font-bold text-white tracking-tight'>{title}</h2>
      </div>
      {actions ? (
        <div className='flex items-center gap-2'>{actions}</div>
      ) : null}
    </div>
    {children}
  </div>
)

const OutputStream = ({
  lines,
  mission,
}: {
  lines: string[]
  mission?: Mission
}) => (
  <div className='bg-black/40 border border-stone-900 p-4 min-h-[240px] max-h-[320px] overflow-y-auto'>
    <div className='flex items-center justify-between mb-3'>
      <div className='text-[10px] text-stone-500 tracking-widest'>
        {mission ? mission.title.toUpperCase() : 'OUTPUT_STREAM'}
      </div>
      <div className='text-[10px] text-emerald-400 flex items-center gap-1'>
        <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />{' '}
        STREAMING
      </div>
    </div>
    <div className='space-y-2 font-mono text-xs text-stone-300'>
      {lines.map((line, idx) => (
        <div key={`${line}-${idx}`} className='flex gap-2'>
          <span className='text-emerald-500'>▌</span>
          <p className='leading-relaxed'>{line}</p>
        </div>
      ))}
    </div>
  </div>
)

const ConversionGate = ({onClose}: {onClose: () => void}) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4'>
    <div className='relative max-w-2xl w-full border border-orange-500/50 bg-zinc-900 p-8'>
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-zinc-500 hover:text-white'
        aria-label='Close conversion gate'
      >
        ×
      </button>
      <div className='text-center mb-6'>
        <div className='inline-flex items-center gap-2 px-4 py-2 mb-4 border border-orange-500/30 bg-orange-500/5 text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
          War Games Locked
        </div>
        <h2 className='text-3xl font-bold tracking-tighter text-white mb-3'>
          Mission Limit Reached
        </h2>
        <p className='text-zinc-400'>
          Unlock unlimited executions, zero cooldowns, and priority lanes for
          $30/mo.
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6'>
        {[
          {label: 'Unlimited Missions', value: '∞'},
          {label: 'Cooldown', value: '0s'},
          {label: 'Priority Queue', value: '10x'},
        ].map((b) => (
          <div
            key={b.label}
            className='p-4 border border-white/10 bg-zinc-800/50 text-center'
          >
            <div className='text-2xl font-bold text-orange-500 mb-1'>
              {b.value}
            </div>
            <div className='text-xs text-zinc-400'>{b.label}</div>
          </div>
        ))}
      </div>
      <div className='flex flex-col sm:flex-row gap-3'>
        <Link
          href='https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00'
          target='_blank'
          rel='noopener noreferrer'
          className='flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-colors'
        >
          <Zap className='w-5 h-5' /> Unlock Pro — $30/mo
        </Link>
        <button
          onClick={onClose}
          className='px-6 py-4 border border-white/10 text-zinc-300 hover:border-white/40 transition-colors'
        >
          Continue Tomorrow
        </button>
      </div>
      <p className='text-center text-xs text-zinc-500 mt-4'>
        Cancel anytime. Full refund within 7 days.
      </p>
    </div>
  </div>
)

export default function WarGamesPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [streamLines, setStreamLines] = useState<string[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>(SYSTEM_EVENTS)
  const [remaining, setRemaining] = useState(DAILY_LIMIT)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const headerTime = useMemo(
    () => currentTime.toISOString().slice(11, 19),
    [currentTime]
  )

  const startMission = () => {
    if (!selectedMission || isStreaming) return
    if (remaining <= 0) {
      setShowGate(true)
      return
    }

    setIsStreaming(true)
    setRemaining((prev) => Math.max(0, prev - 1))
    const lines: string[] = []
    const script = [
      'Calibrating sensors...',
      `Engaging ${selectedMission.title} workflow`,
      'Routing through Daedalus control plane',
      'Streaming intermediate thoughts...',
      'Synthesizing actionable output',
    ]

    script.forEach((line, idx) => {
      setTimeout(() => {
        lines.push(line)
        setStreamLines([...lines])
        if (idx === script.length - 1) {
          setIsStreaming(false)
          setActivity((prev) => [
            {
              time: new Date().toISOString().slice(11, 19) + 'Z',
              mission: selectedMission.title,
              status: 'success',
              detail: inputValue || 'Mission executed with default payload.',
            },
            ...prev,
          ])
          if (lines.length && remaining - 1 <= 0) setShowGate(true)
        }
      }, 600 * (idx + 1))
    })
  }

  const resetMission = () => {
    setSelectedMission(null)
    setStreamLines([])
    setInputValue('')
  }

  return (
    <PageTransition>
      <div className='min-h-screen bg-black text-stone-200 font-mono pt-20 pb-10 px-4'>
        <div
          className='fixed inset-0 opacity-5 pointer-events-none'
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className='max-w-7xl mx-auto relative z-10 space-y-8'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div>
              <div className='text-[10px] text-emerald-700 tracking-widest mb-1'>
                DIGITAL MISCHIEF // WAR_GAMES
              </div>
              <h1 className='text-3xl font-black text-white tracking-tight'>
                Daedalus Simulation Context Active: War Games
              </h1>
            </div>
            <div className='flex items-center gap-6'>
              <div className='text-right'>
                <div className='text-[10px] text-stone-600 tracking-widest'>
                  ZULU_TIME
                </div>
                <div className='text-lg font-bold text-emerald-500 tabular-nums'>
                  {headerTime}
                </div>
              </div>
              <div className='w-px h-10 bg-stone-800' />
              <Link
                href='/schematics'
                className='flex items-center gap-2 text-xs text-stone-500 hover:text-emerald-500 tracking-widest transition-colors'
              >
                SCHEMATICS <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className='bg-zinc-900/40 border border-white/5 p-4 rounded-sm flex items-center justify-between'>
            <UsageIndicator remaining={remaining} limit={DAILY_LIMIT} />
            <div className='flex items-center gap-3 text-[10px] text-stone-500 uppercase tracking-widest'>
              <span className='flex items-center gap-1'>
                <Shield className='w-3 h-3 text-emerald-500' /> Rate Limited
                Sandbox
              </span>
              <span className='flex items-center gap-1'>
                <Zap className='w-3 h-3 text-orange-500' /> Upgrade for
                Unlimited
              </span>
            </div>
          </div>

          <CardShell title='War Games Sandbox' kicker='DAEDALUS BRIEFING'>
            <div className='grid gap-3 md:grid-cols-2 text-sm text-stone-200'>
              <div className='space-y-2'>
                <div className='text-[11px] font-semibold text-white'>
                  What you can do
                </div>
                <ul className='list-disc list-inside space-y-1 text-stone-300'>
                  <li>
                    Run 5 live missions: Agent Sandbox, Prompt Sandbox, PDF
                    Analysis, Document Pipeline, Enrich Profile.
                  </li>
                  <li>
                    Stream reasoning and outputs with Cortex orchestration and
                    Sentience guardrails.
                  </li>
                  <li>Test real AI workflows before committing to PRO.</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <div className='text-[11px] font-semibold text-white'>
                  Rules of engagement
                </div>
                <ul className='list-disc list-inside space-y-1 text-stone-300'>
                  <li>
                    Free tier: {DAILY_LIMIT} missions/day, short cooldowns,
                    1K/2K token envelope.
                  </li>
                  <li>
                    Streaming telemetry feeds the activity log; hit limits to
                    unlock PRO for unlimited runs.
                  </li>
                  <li>
                    Real data paths—no mock results. Keep inputs concise for
                    best speed.
                  </li>
                </ul>
              </div>
            </div>
          </CardShell>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='space-y-6'>
              <ThreatGauge level={2} />
              <div className='bg-black/40 border border-stone-900 p-4'>
                <div className='text-[10px] text-stone-500 tracking-widest mb-3'>
                  SYSTEM_HEALTH
                </div>
                <SystemHealthBar
                  label='NEURAL_NET'
                  health={SYSTEM_STATUS.neural.health}
                  status={SYSTEM_STATUS.neural.status}
                />
                <SystemHealthBar
                  label='FIREWALL'
                  health={SYSTEM_STATUS.firewall.health}
                  status={SYSTEM_STATUS.firewall.status}
                />
                <SystemHealthBar
                  label='ENCRYPTION'
                  health={SYSTEM_STATUS.encryption.health}
                  status={SYSTEM_STATUS.encryption.status}
                />
                <SystemHealthBar
                  label='UPLINK'
                  health={SYSTEM_STATUS.uplink.health}
                  status={SYSTEM_STATUS.uplink.status}
                />
              </div>
              <div className='bg-black/40 border border-stone-900 p-4 space-y-3'>
                <div className='text-[10px] text-stone-500 tracking-widest'>
                  CORE_MODULES
                </div>
                {MODULES.map((module) => (
                  <ModuleCard key={module.id} {...module} />
                ))}
              </div>
              <div className='bg-black/40 border border-stone-900 p-4'>
                <div className='text-[10px] text-stone-500 tracking-widest mb-4'>
                  QUICK_ACTIONS
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <button className='flex items-center justify-center gap-2 p-3 border border-emerald-900 text-emerald-600 text-[10px] tracking-widest hover:bg-emerald-900/20 transition-colors'>
                    <Target size={14} /> NEW_OP
                  </button>
                  <button className='flex items-center justify-center gap-2 p-3 border border-stone-800 text-stone-500 text-[10px] tracking-widest hover:bg-stone-900/20 transition-colors'>
                    <Server size={14} /> SCAN
                  </button>
                  <button className='flex items-center justify-center gap-2 p-3 border border-stone-800 text-stone-500 text-[10px] tracking-widest hover:bg-stone-900/20 transition-colors'>
                    <Database size={14} /> BACKUP
                  </button>
                  <button className='flex items-center justify-center gap-2 p-3 border border-stone-800 text-stone-500 text-[10px] tracking-widest hover:bg-stone-900/20 transition-colors'>
                    <Cpu size={14} /> DIAG
                  </button>
                </div>
              </div>
            </div>

            <div className='space-y-6'>
              {!selectedMission && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 text-[10px] text-stone-500 tracking-widest'>
                    <div className='w-8 h-px bg-orange-500' /> ACTIVE_MISSIONS
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {MISSIONS.map((mission) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        onSelect={() => setSelectedMission(mission)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedMission && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='text-[10px] text-stone-500 tracking-widest'>
                      {selectedMission.classification}
                    </div>
                    <button
                      onClick={resetMission}
                      className='text-[10px] text-stone-400 hover:text-white tracking-widest uppercase'
                    >
                      ← Missions
                    </button>
                  </div>

                  {/* Render appropriate lab component based on mission */}
                  {selectedMission.id === 'agent-sandbox' && (
                    <div className='bg-black/40 border border-stone-900 p-4 min-h-[600px]'>
                      <div className='mb-4 pb-4 border-b border-stone-900'>
                        <div className='text-[10px] text-stone-500 tracking-widest mb-2'>
                          {selectedMission.classification}
                        </div>
                        <h2 className='text-xl font-bold text-white tracking-tight'>
                          {selectedMission.title}
                        </h2>
                        <p className='text-sm text-stone-400 mt-2'>
                          {selectedMission.description}
                        </p>
                      </div>
                      <div className='[&_*]:text-stone-200 [&_*]:font-mono'>
                        <AgentSandbox />
                      </div>
                    </div>
                  )}

                  {selectedMission.id === 'prompt-sandbox' && (
                    <div className='bg-black/40 border border-stone-900 p-4 min-h-[600px]'>
                      <div className='mb-4 pb-4 border-b border-stone-900'>
                        <div className='text-[10px] text-stone-500 tracking-widest mb-2'>
                          {selectedMission.classification}
                        </div>
                        <h2 className='text-xl font-bold text-white tracking-tight'>
                          {selectedMission.title}
                        </h2>
                        <p className='text-sm text-stone-400 mt-2'>
                          {selectedMission.description}
                        </p>
                      </div>
                      <div className='[&_*]:text-stone-200 [&_*]:font-mono'>
                        <PromptLab />
                      </div>
                    </div>
                  )}

                  {selectedMission.id === 'pdf-analysis' && (
                    <div className='bg-black/40 border border-stone-900 p-4 min-h-[600px]'>
                      <div className='mb-4 pb-4 border-b border-stone-900'>
                        <div className='text-[10px] text-stone-500 tracking-widest mb-2'>
                          {selectedMission.classification}
                        </div>
                        <h2 className='text-xl font-bold text-white tracking-tight'>
                          {selectedMission.title}
                        </h2>
                        <p className='text-sm text-stone-400 mt-2'>
                          {selectedMission.description}
                        </p>
                      </div>
                      <div className='[&_*]:text-stone-200 [&_*]:font-mono'>
                        <DocumentLab />
                      </div>
                    </div>
                  )}

                  {selectedMission.id === 'document-pipeline' && (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 items-start'>
                        <div className='xl:col-span-2 space-y-4'>
                          <CardShell
                            title={selectedMission.title}
                            kicker={selectedMission.classification}
                            actions={
                              <span className='text-[10px] px-2 py-1 border border-white/10 text-orange-400 tracking-[0.2em]'>
                                {isStreaming ? 'STREAMING' : 'IDLE'}
                              </span>
                            }
                          >
                            {(() => {
                              const Icon = selectedMission.icon
                              return (
                                <div className='flex items-start gap-3'>
                                  <div className='w-11 h-11 border border-white/10 flex items-center justify-center rounded'>
                                    <Icon className='w-5 h-5 text-orange-400' />
                                  </div>
                                  <p className='text-sm text-stone-300 leading-relaxed'>
                                    {selectedMission.description}
                                  </p>
                                </div>
                              )
                            })()}
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-stone-400 uppercase tracking-widest'>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Primary Model: {selectedMission.primaryModel}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Cooldown: {selectedMission.cooldown}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Tokens: {selectedMission.tokens}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Rate Limit: {remaining}/{DAILY_LIMIT}
                              </div>
                            </div>
                            <textarea
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder='Describe the target: support issue, PDF URL, prompt config, or extraction brief.'
                              className='w-full h-32 bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-orange-500/70 rounded'
                            />
                            <div className='flex items-center gap-3'>
                              <button
                                onClick={startMission}
                                disabled={isStreaming || remaining <= 0}
                                className={cn(
                                  'inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors rounded border border-transparent',
                                  remaining <= 0
                                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                    : 'bg-orange-500 text-white hover:bg-orange-400'
                                )}
                              >
                                <Activity className='w-4 h-4' /> Launch Mission
                              </button>
                              {isStreaming && (
                                <div className='text-[10px] text-emerald-400 uppercase tracking-widest'>
                                  Streaming...
                                </div>
                              )}
                            </div>
                          </CardShell>
                          <CardShell title='Output Stream' kicker='LIVE FEED'>
                            <OutputStream
                              lines={streamLines}
                              mission={selectedMission}
                            />
                          </CardShell>
                        </div>

                        <div className='space-y-3'>
                          <CardShell title='Telemetry' kicker='SYSTEM FEED'>
                            <div className='grid grid-cols-2 gap-2 mb-3'>
                              <StatPill label='CORTEX LATENCY' value='42ms' />
                              <StatPill label='SENTIENCE LOAD' value='48%' />
                              <StatPill
                                label='STREAM STATUS'
                                value={isStreaming ? 'ACTIVE' : 'IDLE'}
                              />
                              <StatPill
                                label='REMAINING'
                                value={`${remaining}/${DAILY_LIMIT}`}
                              />
                            </div>
                            <PhaseList
                              phases={[
                                {
                                  name: 'Cortex Planning',
                                  detail:
                                    'Orchestrator sets phase objectives and selects toolchain.',
                                  status: isStreaming ? 'active' : 'done',
                                },
                                {
                                  name: 'Sentience Execution',
                                  detail:
                                    'Adaptive agent executes with live prompt tuning.',
                                  status: isStreaming ? 'active' : 'done',
                                },
                                {
                                  name: 'Signal Synthesis',
                                  detail:
                                    'Consolidate outputs and prepare actionable summary.',
                                  status: streamLines.length ? 'done' : 'ready',
                                },
                              ]}
                            />
                            <div className='border border-white/10 bg-black/20 backdrop-blur-sm p-3 space-y-2 rounded'>
                              <div className='text-[10px] text-stone-500 tracking-widest'>
                                MODULE LINKS
                              </div>
                              <div className='flex flex-col gap-2 text-[12px] text-stone-200'>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-emerald-500 rounded-full' />{' '}
                                  Cortex Mesh active for orchestration
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-orange-400 rounded-full' />{' '}
                                  Sentience guardrails adapt during stream
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-cyan-400 rounded-full' />{' '}
                                  Telemetry routed to Activity Feed
                                </div>
                              </div>
                            </div>
                          </CardShell>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMission.id === 'enrich-profile' && (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 items-start'>
                        <div className='xl:col-span-2 space-y-4'>
                          <CardShell
                            title={selectedMission.title}
                            kicker={selectedMission.classification}
                            actions={
                              <span className='text-[10px] px-2 py-1 border border-white/10 text-orange-400 tracking-[0.2em]'>
                                {isStreaming ? 'STREAMING' : 'IDLE'}
                              </span>
                            }
                          >
                            {(() => {
                              const Icon = selectedMission.icon
                              return (
                                <div className='flex items-start gap-3'>
                                  <div className='w-11 h-11 border border-white/10 flex items-center justify-center rounded'>
                                    <Icon className='w-5 h-5 text-orange-400' />
                                  </div>
                                  <p className='text-sm text-stone-300 leading-relaxed'>
                                    {selectedMission.description}
                                  </p>
                                </div>
                              )
                            })()}
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-stone-400 uppercase tracking-widest'>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Primary Model: {selectedMission.primaryModel}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Cooldown: {selectedMission.cooldown}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Tokens: {selectedMission.tokens}
                              </div>
                              <div className='border border-white/10 px-3 py-2 rounded'>
                                Rate Limit: {remaining}/{DAILY_LIMIT}
                              </div>
                            </div>
                            <textarea
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder='Describe the target: support issue, PDF URL, prompt config, or extraction brief.'
                              className='w-full h-32 bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-orange-500/70 rounded'
                            />
                            <div className='flex items-center gap-3'>
                              <button
                                onClick={startMission}
                                disabled={isStreaming || remaining <= 0}
                                className={cn(
                                  'inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors rounded border border-transparent',
                                  remaining <= 0
                                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                    : 'bg-orange-500 text-white hover:bg-orange-400'
                                )}
                              >
                                <Activity className='w-4 h-4' /> Launch Mission
                              </button>
                              {isStreaming && (
                                <div className='text-[10px] text-emerald-400 uppercase tracking-widest'>
                                  Streaming...
                                </div>
                              )}
                            </div>
                          </CardShell>
                          <CardShell title='Output Stream' kicker='LIVE FEED'>
                            <OutputStream
                              lines={streamLines}
                              mission={selectedMission}
                            />
                          </CardShell>
                        </div>

                        <div className='space-y-3'>
                          <CardShell title='Telemetry' kicker='SYSTEM FEED'>
                            <div className='grid grid-cols-2 gap-2 mb-3'>
                              <StatPill label='CORTEX LATENCY' value='42ms' />
                              <StatPill label='SENTIENCE LOAD' value='48%' />
                              <StatPill
                                label='STREAM STATUS'
                                value={isStreaming ? 'ACTIVE' : 'IDLE'}
                              />
                              <StatPill
                                label='REMAINING'
                                value={`${remaining}/${DAILY_LIMIT}`}
                              />
                            </div>
                            <PhaseList
                              phases={[
                                {
                                  name: 'Cortex Planning',
                                  detail:
                                    'Orchestrator sets phase objectives and selects toolchain.',
                                  status: isStreaming ? 'active' : 'done',
                                },
                                {
                                  name: 'Sentience Execution',
                                  detail:
                                    'Adaptive agent executes with live prompt tuning.',
                                  status: isStreaming ? 'active' : 'done',
                                },
                                {
                                  name: 'Signal Synthesis',
                                  detail:
                                    'Consolidate outputs and prepare actionable summary.',
                                  status: streamLines.length ? 'done' : 'ready',
                                },
                              ]}
                            />
                            <div className='border border-white/10 bg-black/20 backdrop-blur-sm p-3 space-y-2 rounded'>
                              <div className='text-[10px] text-stone-500 tracking-widest'>
                                MODULE LINKS
                              </div>
                              <div className='flex flex-col gap-2 text-[12px] text-stone-200'>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-emerald-500 rounded-full' />{' '}
                                  Cortex Mesh active for orchestration
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-orange-400 rounded-full' />{' '}
                                  Sentience guardrails adapt during stream
                                </div>
                                <div className='flex items-center gap-2'>
                                  <span className='w-2 h-2 bg-cyan-400 rounded-full' />{' '}
                                  Telemetry routed to Activity Feed
                                </div>
                              </div>
                            </div>
                          </CardShell>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='space-y-6'>
              <div className='bg-black/40 border border-stone-900 p-4'>
                <div className='text-[10px] text-stone-500 tracking-widest mb-4'>
                  GLOBAL_NETWORK
                </div>
                <div className='mb-4'>
                  <HoloGlobe />
                </div>
                {GLOBAL_NODES.map((node) => (
                  <div
                    key={node.id}
                    className='flex items-center justify-between py-2 border-b border-stone-900 last:border-0'
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          node.status === 'online'
                            ? 'bg-emerald-500'
                            : 'bg-yellow-500'
                        )}
                      />
                      <span className='text-xs font-bold'>{node.name}</span>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='text-[10px] text-stone-500'>
                        {node.latency}ms
                      </span>
                      <Wifi
                        size={12}
                        className={
                          node.status === 'online'
                            ? 'text-emerald-600'
                            : 'text-yellow-600'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
              <ActivityFeed items={activity} />
            </div>
          </div>

          <section className='px-2 pb-24'>
            <div className='max-w-7xl mx-auto'>
              <ScrollReveal y={40}>
                <div className='border border-white/10 bg-zinc-900/30 p-12 text-center'>
                  <div className='text-xs text-zinc-500 tracking-widest mb-4'>
                    READY TO DEPLOY?
                  </div>
                  <h2 className='text-3xl md:text-4xl font-bold tracking-tighter mb-6'>
                    Let&apos;s weaponize your growth
                  </h2>
                  <Magnetic strength={0.15}>
                    <Link
                      href='/#audit'
                      className='inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors'
                    >
                      REQUEST ACCESS
                      <ArrowLeft className='w-4 h-4 rotate-180' />
                    </Link>
                  </Magnetic>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </div>

        <AnimatePresence>
          {showGate && <ConversionGate onClose={() => setShowGate(false)} />}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
