import type {ResearchItem} from '@/types'
import {Tag} from '@/components/ui/Tag'
import {BreakthroughBadge} from '@/components/ui/BreakthroughBadge'
import {StakingStats} from '@/components/ui/StakingStats'
import {formatTimeAgo, formatNumber} from '@/lib/format'

interface ResearchCardProps {
  research: ResearchItem
}

export function ResearchCard({research}: ResearchCardProps) {
  const timeAgo = formatTimeAgo(research.createdAt)
  const formattedViews = `${formatNumber(research.views)} views`

  return (
    <article className='bg-card border border-border rounded-2xl p-6 hover:border-border-hover transition-colors'>
      {/* Header with title and icon */}
      <div className='flex justify-between items-start mb-3'>
        <h3 className='text-lg font-medium text-foreground flex-1 pr-4'>
          {research.title}
        </h3>
        <span className='text-2xl'>{research.icon}</span>
      </div>

      {/* Metadata row */}
      <div className='flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground font-mono mb-4'>
        <span>{timeAgo}</span>
        <span className='text-text-tertiary'>·</span>
        <span>{research.primaryCategory}</span>
        {research.secondaryCategory && (
          <>
            <span className='text-text-tertiary'>·</span>
            <span>{research.secondaryCategory}</span>
          </>
        )}
        <span className='text-text-tertiary'>·</span>
        <span>{research.readTimeMinutes} min read</span>
        <span className='text-text-tertiary'>·</span>
        <span>{formattedViews}</span>
      </div>

      {/* Description */}
      <p className='text-sm text-[#888] leading-relaxed mb-4 line-clamp-2'>
        {research.description}
      </p>

      {/* Tags */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {research.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      {/* Stats row */}
      <div className='flex items-center justify-between pt-4 border-t border-border'>
        <StakingStats
          totalStaked={research.totalStaked}
          stakersCount={research.stakersCount}
        />
        <BreakthroughBadge score={research.breakthroughScore} />
      </div>
    </article>
  )
}
