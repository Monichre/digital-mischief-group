'use client'

import Link from 'next/link'
import {ArrowRight, Layers, Radar, Shield, Zap} from 'lucide-react'
import {ScrollReveal, StaggerReveal, GlitchText} from '@/components/scroll-animations'
import {GlowingOrb, IntelCard, RoleBasedAccessControl, SectionGlow} from '@/components/effects'
import type {HomepageContent} from '@/content/homepage'

const iconMap = {
  SENTIENCE: Radar,
  CORTEX: Layers,
  AUTOPILOT: Zap,
  RELAY: Shield,
} as const

export function SolutionSection({solution}: {solution: HomepageContent['solution']}) {
  return (
    <section id={solution.id} className='relative py-32 overflow-hidden'>
      <SectionGlow position='center' intensity='strong' />
      <GlowingOrb size='lg' className='top-[10%] right-[5%]' pulseSpeed={6} />
      <GlowingOrb size='md' color='cyan' className='bottom-[15%] left-[8%]' pulseSpeed={5} />

      <div className='absolute bottom-0 right-0 opacity-40 pointer-events-none hidden lg:block'>
        <RoleBasedAccessControl size='lg' />
      </div>

      <div className='max-w-6xl mx-auto px-6 relative z-10'>
        <ScrollReveal>
          <div className='text-center max-w-4xl mx-auto mb-20'>
            <div className='inline-flex items-center gap-2 px-4 py-2 mb-8 border border-orange-500/30 bg-orange-500/5 rounded-full glitch-hover cursor-default'>
              <Radar className='w-4 h-4 text-orange-500 animate-pulse' />
              <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                {solution.eyebrow}
              </span>
            </div>

            <GlitchText>
              <h2 className='text-4xl md:text-6xl font-black mb-6'>
                {solution.headline.split('Daedalus.')[0]}
                <span className='text-orange-500'>Daedalus.</span>
              </h2>
            </GlitchText>

            <p className='text-heading-md text-zinc-200 font-semibold mb-6'>
              {solution.subhead}
            </p>

            <p className='text-body-xl text-zinc-400 max-w-3xl mx-auto'>
              {solution.body}
            </p>
          </div>
        </ScrollReveal>

        <StaggerReveal className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {solution.cards.map((card) => {
            const Icon = iconMap[card.title as keyof typeof iconMap] ?? Radar
            return (
              <IntelCard
                key={card.title}
                icon={Icon}
                title={card.title}
                subtitle={card.subtitle}
                description={card.body}
                classification='classified'
              >
                {card.tag ? (
                  <div className='mt-4 text-sm font-mono font-bold text-red-500 tracking-wide'>
                    {card.tag}
                  </div>
                ) : null}
              </IntelCard>
            )
          })}
        </StaggerReveal>

        <ScrollReveal>
          <div className='mt-16 text-center'>
            <Link
              href={solution.cta.href}
              className='inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm'
            >
              <Zap className='w-5 h-5' />
              <span>{solution.cta.label}</span>
              <ArrowRight className='w-5 h-5' />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
