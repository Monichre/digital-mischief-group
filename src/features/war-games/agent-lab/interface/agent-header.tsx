import {Copy, Eraser, MoreVertical} from 'lucide-react'
import {motion} from 'motion/react'
import type {FC} from 'react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {useMediaQuery} from '../../../../hooks/use-media-query'
import {agentSelectorVariants} from '../lib/animations'
import type {AgentType} from '../lib/types'

interface AgentHeaderProps {
  selectedAgent: string
  onAgentChange: (agentId: string) => void
  onCopyInput: () => void
  onClearInput: () => void
  hasInput: boolean
  agentTypes: AgentType[]
}

export function AgentHeader({
  selectedAgent,
  onAgentChange,
  onCopyInput,
  onClearInput,
  hasInput,
  agentTypes,
}: AgentHeaderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <motion.header className='flex items-center justify-between gap-4 border-b border-stone-900/80 bg-black/50 p-4'>
      <div className='flex items-center gap-2 text-stone-400'>
        <div className='hidden rounded-full lg:block'>
          <VercelIcon className='size-4 text-orange-400' />
        </div>
        <span className='hidden text-stone-500 text-xs lg:block'>/</span>
        <h1 className='inline-flex items-center gap-1 font-bold text-xs tracking-[0.2em] uppercase'>
          <span className='hidden lg:block'>AI</span>
          <span className='hidden lg:block'>SDK</span>
          <span className='hidden px-1 text-stone-500 text-xs lg:block'>/</span>
          <div className='relative rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 font-medium text-[10px] text-orange-200 shadow-[0_0_12px_rgba(251,146,60,0.2)]'>
            <span className='relative z-10'>Agents</span>
          </div>
        </h1>
      </div>
      {isMobile ? (
        <Select onValueChange={onAgentChange} value={selectedAgent}>
          <SelectTrigger className='w-[200px] border-stone-800 bg-black/60 text-stone-200'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='border-stone-900 bg-black text-stone-200'>
            {agentTypes.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <motion.div
                  className='flex items-center gap-2'
                  initial='initial'
                  variants={agentSelectorVariants}
                  whileHover='hover'
                  whileTap='tap'
                >
                  <span className='font-medium'>{agent.name}</span>
                </motion.div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className='flex items-center gap-1 rounded-full'>
          {agentTypes.map((agent) => (
            <button
              className={`${
                selectedAgent === agent.id
                  ? 'font-medium text-orange-200'
                  : 'text-stone-400 hover:text-orange-300'
              } relative rounded-full px-3 py-1.5 text-xs transition`}
              key={agent.id}
              onClick={() => onAgentChange(agent.id)}
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {selectedAgent === agent.id && (
                <motion.span
                  className='absolute inset-0 z-10 border border-orange-500/40 bg-orange-500/10 shadow-[0_0_16px_rgba(251,146,60,0.15)]'
                  layoutId='bubble'
                  style={{borderRadius: 9999}}
                  transition={{type: 'spring', bounce: 0.2, duration: 0.6}}
                />
              )}

              {agent.name}
            </button>
          ))}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className='h-8 w-8 p-0 text-stone-400 hover:text-orange-300 md:h-9 md:w-9'
            size='sm'
            variant='ghost'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-[180px] border border-stone-900 bg-black text-stone-200'
        >
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-stone-200 focus:bg-stone-900'
            disabled={!hasInput}
            onClick={onCopyInput}
          >
            <Copy className='h-4 w-4' />
            <span>Copy Input</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='flex cursor-pointer items-center gap-2 text-red-400 focus:bg-stone-900 focus:text-red-300'
            disabled={!hasInput}
            onClick={onClearInput}
          >
            <Eraser className='h-4 w-4' />
            <span>Clear Input</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.header>
  )
}

export function VercelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      height='222'
      preserveAspectRatio='xMidYMid'
      viewBox='0 0 256 222'
      width='256'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='m128 0 128 221.705H0z' fill='currentColor' />
    </svg>
  )
}
