import {StrikeOutReveal} from '@/components/effects'
import type {HomepageContent} from '@/content/homepage'

export function WarningSection({warning}: {warning: HomepageContent['warning']}) {
  return (
    <section className='py-32 bg-black relative overflow-hidden'>
      <div
        className='absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none'
        style={{
          background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]' />

      <div className='max-w-xl mx-auto px-6 relative z-10'>
        <div className='font-mono text-left'>
          <div className='text-[10px] text-red-500/80 tracking-widest mb-8 flex items-center gap-2'>
            <div className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
            <span>{warning.eyebrow}</span>
          </div>

          <h2 className='text-3xl md:text-5xl font-black text-white mb-12 leading-tight'>
            {warning.headline[0]}
            <br />
            <span className='text-zinc-500'>{warning.headline[1]}</span>
          </h2>

          <div className='space-y-4 text-body-lg text-zinc-300 mb-12'>
            {warning.list.map((item, index) => (
              <StrikeOutReveal key={item} delay={index * 0.2} duration={0.5}>
                <span className='opacity-90'>{item}</span>
              </StrikeOutReveal>
            ))}
          </div>

          <p className='text-body-lg text-zinc-400 mb-8 leading-relaxed'>{warning.body}</p>

          <p className='text-body-lg text-orange-500 font-bold text-glow-orange pt-4'>
            {warning.punchline}
          </p>
        </div>
      </div>
    </section>
  )
}
