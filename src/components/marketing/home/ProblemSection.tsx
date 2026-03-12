import {X} from 'lucide-react'
import {ScrollReveal, StaggerReveal, GlitchText} from '@/components/scroll-animations'
import {SectionGlow} from '@/components/effects'
import type {HomepageContent} from '@/content/homepage'

export function ProblemSection({problem}: {problem: HomepageContent['problem']}) {
  return (
    <section id='problem' className='relative py-32 overflow-hidden'>
      <SectionGlow position='left' intensity='medium' />
      <div className='max-w-7xl mx-auto px-6 relative z-10'>
        <ScrollReveal>
          <div className='text-center max-w-5xl mx-auto'>
            <div className='inline-flex items-center gap-2 text-xs text-zinc-600 mb-6 glitch-hover cursor-default'>
              <span className='text-orange-500/60'>{'>'}</span>
              <span>{problem.eyebrow}</span>
            </div>

            <GlitchText>
              <h2 className='text-4xl md:text-6xl font-black mb-8'>
                {problem.headline[0]} <span className='text-orange-500'>{problem.headline[1]}</span>
              </h2>
            </GlitchText>

            <div className='max-w-4xl mx-auto mb-16 space-y-6'>
              {problem.body.map((paragraph) => (
                <p key={paragraph} className='text-body-xl text-zinc-300 glass-panel-dark rounded-lg px-6 py-5 border border-zinc-800/60'>
                  {paragraph}
                </p>
              ))}
            </div>

            <StaggerReveal stagger={0.1} className='grid md:grid-cols-3 gap-6 mb-12'>
              {problem.cards.map((item) => (
                <div
                  key={item.title}
                  className='p-8 border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm rounded-lg group hover:border-orange-500/30 transition-colors text-left'
                >
                  <X className='w-6 h-6 text-red-500/70 mb-5' />
                  <h3 className='text-xl font-bold text-zinc-100 mb-3'>{item.title}</h3>
                  <p className='text-base text-zinc-400 leading-relaxed'>{item.body}</p>
                </div>
              ))}
            </StaggerReveal>

            <p className='text-body-xl text-zinc-200 font-semibold max-w-4xl mx-auto'>
              {problem.closing}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
