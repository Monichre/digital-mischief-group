import {cn} from '@/lib/utils'

export const HERO_TICKER_ITEMS = [
  {tag: 'SHIP', text: 'PRODUCTION RAG PIPELINES'},
  {tag: 'SHIP', text: 'AUDITABLE AGENT WORKFLOWS'},
  {tag: 'SHIP', text: 'GOVERNED DATA LAYERS'},
] as const

export function HeroTicker({className}: {className?: string}) {
  return (
    <div className={cn('max-w-4xl mx-auto mb-10', className)}>
      <div className='relative overflow-hidden rounded-sm border border-zinc-800/60 bg-black/60 backdrop-blur-sm'>
        {/* Edge fade */}
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/80 to-transparent' />
          <div className='absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/80 to-transparent' />
        </div>

        <div className='flex w-max items-center gap-6 py-3 px-4 whitespace-nowrap text-xs sm:text-sm font-mono tracking-widest text-zinc-200 motion-reduce:animate-none animate-[hero-ticker_22s_linear_infinite]'>
          {[0, 1].flatMap((dup) =>
            HERO_TICKER_ITEMS.map((item, idx) => (
              <div
                key={`${dup}-${idx}`}
                className='flex items-center gap-3'
                aria-hidden={dup === 1}
              >
                <span className='text-orange-500'>[ {item.tag} ]</span>
                <span className='text-zinc-200'>{item.text}</span>
                <span className='text-zinc-700'>//</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
