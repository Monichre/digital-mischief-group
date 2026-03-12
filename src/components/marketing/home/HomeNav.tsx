'use client'

import Link from 'next/link'
import {ChevronRight, FileSearch, Layers, Radar, Radio, ScanEye, Shield, Swords} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {AuthLinks} from '@/components/AuthLinks'
import {Magnetic} from '@/components/scroll-animations'
import type {HomepageContent} from '@/content/homepage'

const iconMap = {
  'Cortex Vault': Layers,
  'Target Research': FileSearch,
  Surveillance: ScanEye,
  'Asset Extraction': Swords,
  'Threat Intel': Shield,
  'Counter Ops': Radar,
} as const

export function HomeNav({nav}: {nav: HomepageContent['nav']}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className='fixed top-0 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl z-50'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]' />
          <span className='font-mono font-bold tracking-tighter text-lg'>{nav.brand}</span>
        </div>

        <div className='hidden md:flex items-center gap-8 text-sm text-zinc-400'>
          {nav.links.map((link) =>
            link.label === 'Recon' ? (
              <div key={link.label} className='relative' ref={dropdownRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className='flex items-center gap-1 hover:text-white transition-colors'
                >
                  <Radar className='w-3 h-3 text-orange-500' />
                  <span>{link.label}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
                </button>

                {open && (
                  <div className='absolute top-full left-0 mt-2 w-72 rounded-lg border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden'>
                    <div className='px-4 py-3 border-b border-zinc-800/50'>
                      <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                        {nav.reconMenu.label}
                      </span>
                    </div>
                    <div className='py-2'>
                      {nav.reconMenu.items.map((item) => {
                        const Icon = iconMap[item.label as keyof typeof iconMap] ?? Radar
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                          >
                            <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                              <Icon className='w-4 h-4 text-orange-500' />
                            </div>
                            <div>
                              <div className='text-sm text-zinc-200 group-hover:text-white'>{item.label}</div>
                              <div className='text-[10px] text-zinc-500'>{item.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                    <div className='px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30'>
                      <Link
                        href={nav.reconMenu.footerLink.href}
                        onClick={() => setOpen(false)}
                        className='flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-orange-500 transition-colors'
                      >
                        <Radio className='w-3 h-3' />
                        <span>{nav.reconMenu.footerLink.label} →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.label} href={link.href} className='hover:text-white transition-colors relative group'>
                {link.label}
                <span className='absolute -bottom-1 left-0 w-0 h-px bg-orange-500 transition-all group-hover:w-full' />
              </Link>
            )
          )}
        </div>

        <div className='flex items-center gap-4'>
          <AuthLinks />
          <Magnetic strength={0.15}>
            <Link
              href={nav.cta.href}
              className='px-4 py-2 border border-orange-500/50 text-orange-500 text-sm hover:bg-orange-500 hover:text-white transition-all duration-300 btn-glow'
            >
              {nav.cta.label}
            </Link>
          </Magnetic>
        </div>
      </div>
    </nav>
  )
}
