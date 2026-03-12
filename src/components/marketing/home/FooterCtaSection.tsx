import Link from 'next/link'
import {ArrowRight, MessageSquare, Zap} from 'lucide-react'
import {ScrollReveal, GlitchText, Magnetic} from '@/components/scroll-animations'
import type {HomepageContent} from '@/content/homepage'

export function FooterCtaSection({footerCta}: {footerCta: HomepageContent['footerCta']}) {
  const [primary, secondary] = footerCta.ctas

  return (
    <section className='py-32 relative overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05)_0%,transparent_60%)]' />

      <div className='max-w-4xl mx-auto px-6 text-center relative z-10'>
        <ScrollReveal>
          <GlitchText>
            <h2 className='text-4xl md:text-5xl font-black mb-8 text-white'>
              {footerCta.headline}
            </h2>
          </GlitchText>

          <p className='text-body-lg text-zinc-400 italic max-w-2xl mx-auto mb-10'>
            {footerCta.body}
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Magnetic>
              <Link
                href={primary.href}
                className='inline-flex items-center gap-3 px-10 py-5 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm text-lg'
              >
                <Zap className='w-6 h-6' />
                <span>{primary.label}</span>
                <ArrowRight className='w-6 h-6' />
              </Link>
            </Magnetic>
            <a
              href={secondary.href}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-3 px-8 py-5 border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white transition-all rounded-sm text-lg cursor-pointer'
            >
              <MessageSquare className='w-5 h-5 text-orange-500' />
              <span>{secondary.label}</span>
            </a>
          </div>
          <p className='text-[10px] text-zinc-600 mt-3 font-mono'>{footerCta.microcopy}</p>
        </ScrollReveal>
      </div>
    </section>
  )
}
