import type {HomepageContent} from '@/content/homepage'

export function SiteFooter({footer}: {footer: HomepageContent['footer']}) {
  return (
    <footer className='py-12 border-t border-white/5'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]' />
            <span>{footer.legal}</span>
          </div>
          <div className='text-center md:text-right'>
            <div>{footer.tagline}</div>
            <div className='flex items-center justify-center md:justify-end gap-3 mt-1'>
              <span>Systems Online</span>
              <span className='text-green-500'>●</span>
              <span>All Systems Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
