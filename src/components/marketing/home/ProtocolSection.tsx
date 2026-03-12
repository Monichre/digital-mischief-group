import {ArrowRight, MessageSquare} from 'lucide-react'
import {ScrollReveal, StaggerReveal, GlitchText} from '@/components/scroll-animations'
import type {HomepageContent} from '@/content/homepage'

export function ProtocolSection({protocol}: {protocol: HomepageContent['protocol']}) {
  return (
    <section className='relative py-32 overflow-hidden'>
      <div className='max-w-6xl mx-auto px-6 relative z-10'>
        <ScrollReveal>
          <div className='text-center max-w-4xl mx-auto mb-16'>
            <div className='inline-flex items-center gap-2 text-xs text-zinc-600 mb-6 glitch-hover cursor-default'>
              <span className='text-orange-500/60'>{'>'}</span>
              <span>{protocol.eyebrow}</span>
            </div>

            <GlitchText>
              <h2 className='text-4xl md:text-6xl font-black mb-8 text-white'>
                {protocol.headline}
              </h2>
            </GlitchText>

            <p className='text-body-xl text-zinc-300 max-w-3xl mx-auto glass-panel-dark rounded-lg px-6 py-5 border border-zinc-800/70'>
              {protocol.body}
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-10'>
          {protocol.steps.map((step) => (
            <div key={step.number} className='rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-5 text-left'>
              <div className='text-xs tracking-[0.25em] text-orange-500 mb-3'>{step.number}</div>
              <h3 className='text-lg font-bold text-zinc-100 mb-3'>{step.title}</h3>
              <p className='text-sm text-zinc-400 leading-relaxed'>{step.body}</p>
            </div>
          ))}
        </StaggerReveal>

        <div className='text-center max-w-3xl mx-auto'>
          <p className='text-body-lg text-zinc-300 mb-8'>{protocol.closing}</p>
          <a
            href={protocol.cta.href}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-3 px-8 py-4 border border-orange-500/50 text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all duration-300 btn-glow rounded-sm'
          >
            <MessageSquare className='w-5 h-5' />
            <span>{protocol.cta.label}</span>
            <ArrowRight className='w-5 h-5' />
          </a>
        </div>
      </div>
    </section>
  )
}
