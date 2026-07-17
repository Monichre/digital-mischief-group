'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Bot, Flame, Radar, Rocket, Shield } from 'lucide-react'

import { HYPERBROWSER_PRESETS, type HyperbrowserPresetKey } from '@/daedalus/browser/presets'
import { Button } from '@/components/ui/button'

type Mode = 'firecrawl_browser' | 'firecrawl_agent' | 'hyper_stack'

type ExecutionResponse = {
  mode?: string
  error?: string
  [key: string]: unknown
}

const initialPreset = HYPERBROWSER_PRESETS[0]

export default function WeaponizeBrowserPage() {
  const searchParams = useSearchParams()
  const [activeMode, setActiveMode] = useState<Mode>('hyper_stack')
  const [selectedPreset, setSelectedPreset] = useState<HyperbrowserPresetKey>(initialPreset.key)

  const [browserUrl, setBrowserUrl] = useState('https://firecrawl.dev')
  const [browserCode, setBrowserCode] = useState('')

  const [agentPrompt, setAgentPrompt] = useState(
    'Map the latest browser automation tools and compare positioning across top products.'
  )
  const [agentUrls, setAgentUrls] = useState('https://docs.firecrawl.dev/features/browser')
  const [agentModel, setAgentModel] = useState('FIRE-1')
  const [agentMaxCredits, setAgentMaxCredits] = useState('5')

  const [trendQuery, setTrendQuery] = useState<string>(
    () => searchParams.get('query') || initialPreset.defaultInput.query || ''
  )
  const [competitorUrls, setCompetitorUrls] = useState(
    (HYPERBROWSER_PRESETS.find((p) => p.key === 'competitor_analyzer')?.defaultInput.urls || []).join('\n')
  )
  const [companyName, setCompanyName] = useState(
    HYPERBROWSER_PRESETS.find((p) => p.key === 'company_researcher')?.defaultInput.companyName || ''
  )
  const [researchTopic, setResearchTopic] = useState(
    HYPERBROWSER_PRESETS.find((p) => p.key === 'company_researcher')?.defaultInput.researchTopic || ''
  )
  const [trainUrls, setTrainUrls] = useState(
    (HYPERBROWSER_PRESETS.find((p) => p.key === 'hyper_train')?.defaultInput.urls || []).join('\n')
  )
  const [trainOutputDir, setTrainOutputDir] = useState<string>(
    HYPERBROWSER_PRESETS.find((p) => p.key === 'hyper_train')?.defaultInput.outputDir || 'tmp/hyper-train'
  )
  const [trainChunkSize, setTrainChunkSize] = useState('900')
  const [trainConcurrency, setTrainConcurrency] = useState('3')
  const [trainEmbeddings, setTrainEmbeddings] = useState(false)
  const [trainQa, setTrainQa] = useState(false)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ExecutionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activePreset = useMemo(
    () => HYPERBROWSER_PRESETS.find((preset) => preset.key === selectedPreset) || null,
    [selectedPreset]
  )

  const handlePresetSelect = (presetKey: HyperbrowserPresetKey) => {
    setSelectedPreset(presetKey)
    setActiveMode('hyper_stack')

    const preset = HYPERBROWSER_PRESETS.find((item) => item.key === presetKey)
    if (!preset) return

    if (preset.key === 'trend_summary' && preset.defaultInput.query) {
      setTrendQuery(preset.defaultInput.query)
    }

    if (preset.key === 'competitor_analyzer' && preset.defaultInput.urls) {
      setCompetitorUrls(preset.defaultInput.urls.join('\n'))
    }

    if (preset.key === 'company_researcher') {
      if (preset.defaultInput.companyName) setCompanyName(preset.defaultInput.companyName)
      if (preset.defaultInput.researchTopic) setResearchTopic(preset.defaultInput.researchTopic)
    }

    if (preset.key === 'hyper_train') {
      if (preset.defaultInput.urls) setTrainUrls(preset.defaultInput.urls.join('\n'))
      if (preset.defaultInput.outputDir) setTrainOutputDir(preset.defaultInput.outputDir)
      if (preset.defaultInput.chunkSize) setTrainChunkSize(String(preset.defaultInput.chunkSize))
      if (preset.defaultInput.concurrency) setTrainConcurrency(String(preset.defaultInput.concurrency))
      setTrainEmbeddings(Boolean(preset.defaultInput.includeEmbeddings))
      setTrainQa(Boolean(preset.defaultInput.includeQaGeneration))
    }
  }

  const execute = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      let payload: Record<string, unknown>

      if (activeMode === 'firecrawl_browser') {
        payload = {
          mode: 'firecrawl_browser',
          url: browserUrl,
          code: browserCode.trim() || undefined,
        }
      } else if (activeMode === 'firecrawl_agent') {
        payload = {
          mode: 'firecrawl_agent',
          prompt: agentPrompt,
          urls: agentUrls
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          model: agentModel || undefined,
          maxCredits: agentMaxCredits ? Number(agentMaxCredits) : undefined,
        }
      } else if (selectedPreset === 'hyper_train') {
        payload = {
          mode: 'hyper_train',
          urls: trainUrls
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
          outputDir: trainOutputDir,
          chunkSize: trainChunkSize ? Number(trainChunkSize) : undefined,
          concurrency: trainConcurrency ? Number(trainConcurrency) : undefined,
          includeEmbeddings: trainEmbeddings,
          includeQaGeneration: trainQa,
        }
      } else if (selectedPreset === 'trend_summary') {
        payload = {
          mode: 'hyperbrowser_strategy',
          payload: {
            strategy: 'trend_summary',
            query: trendQuery,
          },
        }
      } else if (selectedPreset === 'competitor_analyzer') {
        payload = {
          mode: 'hyperbrowser_strategy',
          payload: {
            strategy: 'competitor_analyzer',
            urls: competitorUrls
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean),
          },
        }
      } else {
        payload = {
          mode: 'hyperbrowser_strategy',
          payload: {
            strategy: 'company_researcher',
            companyName,
            researchTopic,
          },
        }
      }

      const response = await fetch('/api/weaponize-browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as ExecutionResponse
      if (!response.ok) {
        setError(data.error || 'Execution failed')
        return
      }

      setResult(data)
    } catch (executionError) {
      setError(executionError instanceof Error ? executionError.message : 'Execution failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      <header className='border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to HQ</span>
          </Link>
          <div className='text-[11px] tracking-wider text-orange-500 flex items-center gap-2'>
            <Flame className='w-4 h-4' />
            <span>WEAPONIZE YOUR BROWSER</span>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-10 space-y-8'>
        <section className='space-y-4'>
          <div className='inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500'>
            <Radar className='w-3 h-3 text-orange-500' />
            <span>// BROWSER BALLISTICS PACKAGE</span>
          </div>
          <h1 className='text-3xl md:text-4xl font-black'>
            Weaponize Your <span className='text-orange-500'>Browser</span>
          </h1>
          <p className='text-zinc-500 max-w-3xl'>
            Deploy Firecrawl browser sandbox, Firecrawl agent deep research, and baked-in HyperBrowser
            mission presets from one control surface.
          </p>
        </section>

        <section className='grid gap-4 md:grid-cols-3'>
          <button
            type='button'
            onClick={() => setActiveMode('firecrawl_browser')}
            className={`p-4 border text-left transition-colors ${
              activeMode === 'firecrawl_browser'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <Shield className='w-4 h-4 text-orange-500 mb-2' />
            <div className='text-sm font-bold'>Firecrawl Browser Sandbox</div>
            <div className='text-xs text-zinc-500 mt-1'>Ghost Protocol execution container</div>
          </button>

          <button
            type='button'
            onClick={() => setActiveMode('firecrawl_agent')}
            className={`p-4 border text-left transition-colors ${
              activeMode === 'firecrawl_agent'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <Bot className='w-4 h-4 text-orange-500 mb-2' />
            <div className='text-sm font-bold'>Firecrawl Agent</div>
            <div className='text-xs text-zinc-500 mt-1'>Swarm Engine deep-research missions</div>
          </button>

          <button
            type='button'
            onClick={() => setActiveMode('hyper_stack')}
            className={`p-4 border text-left transition-colors ${
              activeMode === 'hyper_stack'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <Rocket className='w-4 h-4 text-orange-500 mb-2' />
            <div className='text-sm font-bold'>HyperBrowser Strategy Stack</div>
            <div className='text-xs text-zinc-500 mt-1'>Trend, competitor, company, and Hyper Train presets</div>
          </button>
        </section>

        {activeMode === 'firecrawl_browser' && (
          <section className='border border-zinc-800 bg-zinc-900/30 p-5 space-y-4'>
            <h2 className='text-sm text-orange-500 tracking-wide'>FIRECRAWL BROWSER SANDBOX</h2>
            <div className='space-y-2'>
              <label className='text-xs text-zinc-500'>Target URL</label>
              <input
                value={browserUrl}
                onChange={(event) => setBrowserUrl(event.target.value)}
                className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-xs text-zinc-500'>Optional Browser Script (Node)</label>
              <textarea
                value={browserCode}
                onChange={(event) => setBrowserCode(event.target.value)}
                placeholder='Leave blank to run default navigation + title capture script'
                className='w-full h-36 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs'
              />
            </div>
          </section>
        )}

        {activeMode === 'firecrawl_agent' && (
          <section className='border border-zinc-800 bg-zinc-900/30 p-5 space-y-4'>
            <h2 className='text-sm text-orange-500 tracking-wide'>FIRECRAWL AGENT DEEP RESEARCH</h2>
            <div className='space-y-2'>
              <label className='text-xs text-zinc-500'>Mission Prompt</label>
              <textarea
                value={agentPrompt}
                onChange={(event) => setAgentPrompt(event.target.value)}
                className='w-full h-24 bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
              />
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label className='text-xs text-zinc-500'>Seed URLs (one per line)</label>
                <textarea
                  value={agentUrls}
                  onChange={(event) => setAgentUrls(event.target.value)}
                  className='w-full h-24 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs'
                />
              </div>
              <div className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-xs text-zinc-500'>Model</label>
                  <input
                    value={agentModel}
                    onChange={(event) => setAgentModel(event.target.value)}
                    className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-xs text-zinc-500'>Max Credits</label>
                  <input
                    type='number'
                    value={agentMaxCredits}
                    onChange={(event) => setAgentMaxCredits(event.target.value)}
                    className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMode === 'hyper_stack' && (
          <section className='space-y-4'>
            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {HYPERBROWSER_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type='button'
                  onClick={() => handlePresetSelect(preset.key)}
                  className={`p-4 border text-left transition-colors ${
                    selectedPreset === preset.key
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <div className='text-xs text-zinc-500 mb-1'>PRECONFIGURED</div>
                  <div className='text-sm font-bold mb-2'>{preset.label}</div>
                  <div className='text-xs text-zinc-500'>{preset.mission}</div>
                </button>
              ))}
            </div>

            <div className='border border-zinc-800 bg-zinc-900/30 p-5 space-y-4'>
              <h2 className='text-sm text-orange-500 tracking-wide'>
                {activePreset?.label || 'HYPERBROWSER PRESET'}
              </h2>

              {selectedPreset === 'trend_summary' && (
                <div className='space-y-2'>
                  <label className='text-xs text-zinc-500'>Trend Query</label>
                  <input
                    value={trendQuery}
                    onChange={(event) => setTrendQuery(event.target.value)}
                    className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                  />
                </div>
              )}

              {selectedPreset === 'competitor_analyzer' && (
                <div className='space-y-2'>
                  <label className='text-xs text-zinc-500'>Competitor URLs (one per line)</label>
                  <textarea
                    value={competitorUrls}
                    onChange={(event) => setCompetitorUrls(event.target.value)}
                    className='w-full h-28 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs'
                  />
                </div>
              )}

              {selectedPreset === 'company_researcher' && (
                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <label className='text-xs text-zinc-500'>Company Name</label>
                    <input
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-xs text-zinc-500'>Research Topic</label>
                    <input
                      value={researchTopic}
                      onChange={(event) => setResearchTopic(event.target.value)}
                      className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                    />
                  </div>
                </div>
              )}

              {selectedPreset === 'hyper_train' && (
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-xs text-zinc-500'>Training URLs (one per line)</label>
                    <textarea
                      value={trainUrls}
                      onChange={(event) => setTrainUrls(event.target.value)}
                      className='w-full h-28 bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs'
                    />
                  </div>
                  <div className='grid md:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-xs text-zinc-500'>Output Directory</label>
                      <input
                        value={trainOutputDir}
                        onChange={(event) => setTrainOutputDir(event.target.value)}
                        className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs text-zinc-500'>Chunk Size</label>
                      <input
                        type='number'
                        value={trainChunkSize}
                        onChange={(event) => setTrainChunkSize(event.target.value)}
                        className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs text-zinc-500'>Concurrency</label>
                      <input
                        type='number'
                        value={trainConcurrency}
                        onChange={(event) => setTrainConcurrency(event.target.value)}
                        className='w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm'
                      />
                    </div>
                  </div>
                  <div className='flex items-center gap-5 text-xs text-zinc-400'>
                    <label className='inline-flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={trainEmbeddings}
                        onChange={(event) => setTrainEmbeddings(event.target.checked)}
                      />
                      Include Embeddings
                    </label>
                    <label className='inline-flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={trainQa}
                        onChange={(event) => setTrainQa(event.target.checked)}
                      />
                      Include QA Pairs
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div className='flex items-center gap-3'>
          <Button
            onClick={execute}
            disabled={loading}
            className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
          >
            {loading ? 'Executing...' : 'Execute Mission'}
          </Button>
          <span className='text-xs text-zinc-500'>
            Endpoint: <code>/api/weaponize-browser</code>
          </span>
        </div>

        {error && (
          <div className='border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>{error}</div>
        )}

        {result && (
          <section className='border border-zinc-800 bg-zinc-900/30 p-5'>
            <h3 className='text-sm text-orange-500 mb-3 tracking-wide'>MISSION OUTPUT</h3>
            <pre className='text-xs overflow-auto whitespace-pre-wrap break-all text-zinc-300'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  )
}
