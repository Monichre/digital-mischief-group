'use client'

import type React from 'react'

import {useState} from 'react'
import {useObject} from '@ai-sdk/react'
import {z} from 'zod'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {
  Loader2,
  Sparkles,
  Building2,
  Users,
  Globe,
  TrendingUp,
  Linkedin,
  Twitter,
} from 'lucide-react'

// Schema for enriched company data
export const companyEnrichmentSchema = z.object({
  company: z.object({
    name: z.string().describe('Company name'),
    description: z.string().describe('Brief company description'),
    industry: z.string().describe('Primary industry'),
    subIndustry: z.string().optional().describe('Sub-industry or niche'),
    founded: z.string().optional().describe('Year founded'),
    headquarters: z.string().optional().describe('Headquarters location'),
    employeeRange: z.string().optional().describe('Employee count range'),
    revenue: z.string().optional().describe('Revenue estimate'),
    fundingStage: z.string().optional().describe('Funding stage if applicable'),
  }),
  leadership: z
    .array(
      z.object({
        name: z.string(),
        title: z.string(),
        linkedin: z.string().optional(),
      })
    )
    .optional()
    .describe('Key leadership team members'),
  technologies: z.array(z.string()).optional().describe('Technologies used'),
  competitors: z.array(z.string()).optional().describe('Main competitors'),
  marketPosition: z
    .object({
      strengths: z.array(z.string()),
      opportunities: z.array(z.string()),
    })
    .optional()
    .describe('Market positioning analysis'),
  socialPresence: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  enrichmentScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Data completeness score'),
})

export type CompanyEnrichment = z.infer<typeof companyEnrichmentSchema>

interface EnrichFormProps {
  onEnrichComplete?: (data: CompanyEnrichment) => void
}

export function EnrichForm({onEnrichComplete}: EnrichFormProps) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'url' | 'email' | 'text'>('url')

  const {object, submit, isLoading, error} = useObject({
    api: '/api/ai/enrich',
    schema: companyEnrichmentSchema,
    onFinish: ({object}) => {
      if (object && onEnrichComplete) {
        onEnrichComplete(object as CompanyEnrichment)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    submit({input, inputType})
  }

  const detectInputType = (value: string) => {
    if (value.includes('@')) return 'email'
    if (value.startsWith('http') || value.includes('.com')) return 'url'
    return 'text'
  }

  return (
    <div className='space-y-6'>
      {/* Input Form */}
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-zinc-100 font-mono text-sm'>
            <Sparkles className='w-4 h-4 text-orange-500' />
            AI-POWERED ENRICHMENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='flex gap-2'>
              <Input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setInputType(detectInputType(e.target.value))
                }}
                placeholder='Enter URL, email, or company name...'
                className='bg-zinc-950 border-zinc-700 text-zinc-100 font-mono'
              />
              <Button
                type='submit'
                disabled={isLoading || !input.trim()}
                className='bg-orange-500 hover:bg-orange-600 text-black font-mono'
              >
                {isLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  'ENRICH'
                )}
              </Button>
            </div>
            <div className='flex gap-2'>
              <Badge
                variant='outline'
                className={`cursor-pointer ${
                  inputType === 'url'
                    ? 'bg-orange-500/20 border-orange-500'
                    : 'border-zinc-700'
                }`}
              >
                URL
              </Badge>
              <Badge
                variant='outline'
                className={`cursor-pointer ${
                  inputType === 'email'
                    ? 'bg-orange-500/20 border-orange-500'
                    : 'border-zinc-700'
                }`}
              >
                Email
              </Badge>
              <Badge
                variant='outline'
                className={`cursor-pointer ${
                  inputType === 'text'
                    ? 'bg-orange-500/20 border-orange-500'
                    : 'border-zinc-700'
                }`}
              >
                Company
              </Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className='bg-red-950/20 border-red-900'>
          <CardContent className='pt-4'>
            <p className='text-red-400 font-mono text-sm'>{error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Streaming Results */}
      {object && (
        <div className='grid gap-4'>
          {/* Company Overview */}
          {object.company && (
            <Card className='bg-zinc-900/50 border-zinc-800'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-zinc-100'>
                    <Building2 className='w-5 h-5 text-orange-500' />
                    {object.company.name || 'Loading...'}
                  </CardTitle>
                  {object.enrichmentScore !== undefined && (
                    <Badge className='bg-orange-500/20 text-orange-400 border-orange-500/50'>
                      {object.enrichmentScore}% Complete
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {object.company.description && (
                  <p className='text-zinc-400 text-sm'>
                    {object.company.description}
                  </p>
                )}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  {object.company.industry && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        INDUSTRY
                      </span>
                      <p className='text-zinc-200'>{object.company.industry}</p>
                    </div>
                  )}
                  {object.company.headquarters && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        HQ
                      </span>
                      <p className='text-zinc-200'>
                        {object.company.headquarters}
                      </p>
                    </div>
                  )}
                  {object.company.employeeRange && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        SIZE
                      </span>
                      <p className='text-zinc-200'>
                        {object.company.employeeRange}
                      </p>
                    </div>
                  )}
                  {object.company.fundingStage && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        FUNDING
                      </span>
                      <p className='text-zinc-200'>
                        {object.company.fundingStage}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leadership */}
          {object.leadership && object.leadership.length > 0 && (
            <Card className='bg-zinc-900/50 border-zinc-800'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-zinc-100 text-sm font-mono'>
                  <Users className='w-4 h-4 text-orange-500' />
                  LEADERSHIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-2'>
                  {object.leadership.map((person, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between p-2 bg-zinc-950/50 rounded'
                    >
                      <div>
                        <p className='text-zinc-200 text-sm'>{person.name}</p>
                        <p className='text-zinc-500 text-xs'>{person.title}</p>
                      </div>
                      {person.linkedin && (
                        <Linkedin className='w-4 h-4 text-zinc-500' />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technologies & Competitors */}
          <div className='grid md:grid-cols-2 gap-4'>
            {object.technologies && object.technologies.length > 0 && (
              <Card className='bg-zinc-900/50 border-zinc-800'>
                <CardHeader>
                  <CardTitle className='text-zinc-100 text-sm font-mono'>
                    TECH STACK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {object.technologies.map((tech, i) => (
                      <Badge
                        key={i}
                        variant='outline'
                        className='border-zinc-700 text-zinc-300'
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {object.competitors && object.competitors.length > 0 && (
              <Card className='bg-zinc-900/50 border-zinc-800'>
                <CardHeader>
                  <CardTitle className='text-zinc-100 text-sm font-mono'>
                    COMPETITORS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-wrap gap-2'>
                    {object.competitors.map((comp, i) => (
                      <Badge
                        key={i}
                        variant='outline'
                        className='border-orange-500/30 text-orange-400'
                      >
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Market Position */}
          {object.marketPosition && (
            <Card className='bg-zinc-900/50 border-zinc-800'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-zinc-100 text-sm font-mono'>
                  <TrendingUp className='w-4 h-4 text-orange-500' />
                  MARKET POSITION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid md:grid-cols-2 gap-4'>
                  {object.marketPosition.strengths && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        STRENGTHS
                      </span>
                      <ul className='mt-2 space-y-1'>
                        {object.marketPosition.strengths.map((s, i) => (
                          <li
                            key={i}
                            className='text-zinc-300 text-sm flex items-start gap-2'
                          >
                            <span className='text-green-500'>+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {object.marketPosition.opportunities && (
                    <div>
                      <span className='text-zinc-500 font-mono text-xs'>
                        OPPORTUNITIES
                      </span>
                      <ul className='mt-2 space-y-1'>
                        {object.marketPosition.opportunities.map((o, i) => (
                          <li
                            key={i}
                            className='text-zinc-300 text-sm flex items-start gap-2'
                          >
                            <span className='text-orange-500'>→</span> {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          {object.socialPresence && (
            <div className='flex gap-4 justify-center'>
              {object.socialPresence.website && (
                <a
                  href={object.socialPresence.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-zinc-500 hover:text-orange-500 transition-colors'
                >
                  <Globe className='w-5 h-5' />
                </a>
              )}
              {object.socialPresence.linkedin && (
                <a
                  href={object.socialPresence.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-zinc-500 hover:text-orange-500 transition-colors'
                >
                  <Linkedin className='w-5 h-5' />
                </a>
              )}
              {object.socialPresence.twitter && (
                <a
                  href={object.socialPresence.twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-zinc-500 hover:text-orange-500 transition-colors'
                >
                  <Twitter className='w-5 h-5' />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !object && (
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardContent className='py-8 flex flex-col items-center gap-4'>
            <Loader2 className='w-8 h-8 animate-spin text-orange-500' />
            <p className='text-zinc-500 font-mono text-sm'>ENRICHING DATA...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnrichForm
