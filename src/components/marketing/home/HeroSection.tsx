import Link from 'next/link'
import {ArrowRight, Flame, MessageSquare, Radar, Zap} from 'lucide-react'
import {CapabilitiesStrip} from '@/components/CapabilitiesStrip'
import {HeroTicker} from '@/components/HeroTicker'
import {TypeWriter} from '@/components/TypeWriter'
import {ScrollReveal, StaggerReveal, Parallax, Magnetic} from '@/components/scroll-animations'
import {HUDCorners, HoloText, FloatingStatus, HeroBurst, GlowingOrb} from '@/components/effects'
import type {HomepageContent} from '@/content/homepage'

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

export function HeroSection({hero}: {hero: HomepageContent['hero']}) {
  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
      <HeroBurst />
      <FloatingStatus />
      <GlowingOrb size='lg' className='top-[15%] left-[5%]' pulseSpeed={5} />
      <GlowingOrb size='xl' className='bottom-[20%] right-[8%]' pulseSpeed={7} />
      <GlowingOrb size='md' color='cyan' className='top-[40%] right-[15%]' pulseSpeed={4} />

      <Parallax speed={0.3} direction='up' className='absolute top-20 left-10 text-orange-500/10 text-8xl font-bold select-none'>
        //
      </Parallax>
      <Parallax speed={0.5} direction='down' className='absolute bottom-32 right-20 text-orange-500/5 text-9xl font-bold select-none'>
        {'{ }'}
      </Parallax>
      <Parallax speed={0.2} direction='left' className='absolute top-1/3 right-10 text-zinc-800 text-6xl font-mono select-none'>
        01
      </Parallax>

      <div className='relative z-10 max-w-5xl mx-auto px-6 text-center pt-20'>
        <ScrollReveal y={30} duration={0.8}>
          <div className='mb-12'>
            <HUDCorners status='online' showTimestamp label='SYSTEM ACTIVE'>
              <div className='p-12'>
                <h1 className='text-4xl md:text-7xl font-black tracking-tighter'>
                  <span className='bg-gradient-to-r from-zinc-500 to-zinc-200 bg-clip-text text-transparent'>
                    DIGITAL
                  </span>{' '}
                  <HoloText className='text-orange-500' glitchInterval={4000}>
                    MISCHIEF
                  </HoloText>
                </h1>
              </div>
            </HUDCorners>

            <div className='flex items-center justify-center gap-4 mt-8'>
              <div className='h-px w-20 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
              <span className='inline-flex items-center gap-2 text-sm text-zinc-500 italic tracking-wide'>
                an ideas lab with matches
                <Flame className='w-4 h-4 text-orange-500 animate-pulse' />
              </span>
              <div className='h-px w-20 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
            </div>
          </div>
        </ScrollReveal>

        <div className='text-xs text-zinc-600 font-mono mb-6 glitch-hover cursor-default'>
          <span className='text-orange-500/60'>{'>'}</span>
          <span> {hero.eyebrow.replace('// ', '')}</span>
          <span className='animate-pulse text-orange-500'>_</span>
        </div>

        <h2 className='text-display-lg mb-10'>
          <span className='text-white'>
            <TypeWriter text={hero.headline[0]} speed={50} />
          </span>
          <br />
          <span className='text-orange-500 text-glow-orange'>
            <TypeWriter text={hero.headline[1]} speed={50} delay={900} />
          </span>
        </h2>

        <ScrollReveal y={20} delay={0.3}>
          <p className='text-body-xl text-zinc-300 max-w-3xl mx-auto mb-10 glass-panel-dark rounded-lg px-6 py-5 border border-zinc-800/70'>
            {hero.body}
          </p>
        </ScrollReveal>

        <ScrollReveal y={10} delay={0.35}>
          <CapabilitiesStrip items={[...hero.proofStrip]} />
        </ScrollReveal>

        <ScrollReveal y={10} delay={0.4}>
          <HeroTicker items={hero.ticker} />
        </ScrollReveal>

        <StaggerReveal stagger={0.1} className='flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap'>
          {hero.ctas.map((cta, index) => {
            const icon = index === 0 ? <Zap className='w-5 h-5' /> : index === 1 ? <Radar className='w-4 h-4 text-orange-500' /> : <MessageSquare className='w-4 h-4' />
            if (cta.intent === 'primary') {
              return (
                <Magnetic key={cta.label}>
                  <Link href={cta.href} className='group flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm'>
                    {icon}
                    <span>{cta.label}</span>
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </Link>
                </Magnetic>
              )
            }

            if (cta.intent === 'secondary') {
              return (
                <Link
                  key={cta.label}
                  href={cta.href}
                  className='group flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white transition-all duration-300 rounded-sm glass-panel'
                >
                  {icon}
                  <span>{cta.label}</span>
                  <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </Link>
              )
            }

            return isExternal(cta.href) ? (
              <a
                key={cta.label}
                href={cta.href}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-orange-500 transition-colors text-sm'
              >
                {icon}
                <span>{cta.label}</span>
              </a>
            ) : (
              <Link key={cta.label} href={cta.href} className='flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-orange-500 transition-colors text-sm'>
                {icon}
                <span>{cta.label}</span>
              </Link>
            )
          })}
        </StaggerReveal>
      </div>

      <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600'>
        <span className='text-[10px] tracking-[0.3em] uppercase'>Scroll</span>
        <div className='w-px h-10 bg-gradient-to-b from-orange-500/50 to-transparent' />
      </div>
    </section>
  )
}
