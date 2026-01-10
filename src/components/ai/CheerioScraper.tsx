'use client'

import type React from 'react'

import {useState} from 'react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import {
  Globe,
  Loader2,
  Link2,
  ImageIcon,
  FileText,
  Code,
  Download,
  Copy,
  CheckCircle2,
} from 'lucide-react'

interface ScrapedData {
  url: string
  title?: string
  description?: string
  content?: string
  links?: {href: string; text: string}[]
  images?: {src: string; alt: string}[]
  metadata?: Record<string, string>
  structuredData?: unknown
  scrapedAt: string
}

interface CheerioScraperProps {
  onScrapeComplete?: (data: ScrapedData) => void
}

export function CheerioScraper({onScrapeComplete}: CheerioScraperProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/scrape', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url}),
      })

      if (!response.ok) {
        throw new Error('Failed to scrape URL')
      }

      const data = await response.json()
      setScrapedData(data)
      if (onScrapeComplete) {
        onScrapeComplete(data)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportData = () => {
    if (!scrapedData) return
    const blob = new Blob([JSON.stringify(scrapedData, null, 2)], {
      type: 'application/json',
    })
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `scraped-${new URL(scrapedData.url).hostname}.json`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  return (
    <div className='space-y-6'>
      {/* URL Input */}
      <Card className='bg-zinc-900/50 border-zinc-800'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-zinc-100 font-mono text-sm'>
            <Globe className='w-4 h-4 text-orange-500' />
            WEB CONTENT EXTRACTOR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScrape} className='flex gap-2'>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://example.com'
              type='url'
              className='bg-zinc-950 border-zinc-700 text-zinc-100 font-mono'
            />
            <Button
              type='submit'
              disabled={isLoading || !url.trim()}
              className='bg-orange-500 hover:bg-orange-600 text-black font-mono'
            >
              {isLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'EXTRACT'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className='bg-red-950/20 border-red-900'>
          <CardContent className='pt-4'>
            <p className='text-red-400 font-mono text-sm'>{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {scrapedData && (
        <Card className='bg-zinc-900/50 border-zinc-800'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-zinc-100'>
                  {scrapedData.title || 'Untitled'}
                </CardTitle>
                <p className='text-zinc-500 text-sm font-mono mt-1'>
                  {scrapedData.url}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    copyToClipboard(JSON.stringify(scrapedData, null, 2))
                  }
                  className='border-zinc-700 text-zinc-300 font-mono text-xs'
                >
                  {copied ? (
                    <CheckCircle2 className='w-3 h-3 mr-1 text-green-400' />
                  ) : (
                    <Copy className='w-3 h-3 mr-1' />
                  )}
                  {copied ? 'COPIED' : 'COPY'}
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={exportData}
                  className='border-zinc-700 text-zinc-300 font-mono text-xs bg-transparent'
                >
                  <Download className='w-3 h-3 mr-1' />
                  EXPORT
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='content' className='w-full'>
              <TabsList className='bg-zinc-950 border border-zinc-800'>
                <TabsTrigger
                  value='content'
                  className='font-mono text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-black'
                >
                  <FileText className='w-3 h-3 mr-1' />
                  CONTENT
                </TabsTrigger>
                <TabsTrigger
                  value='links'
                  className='font-mono text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-black'
                >
                  <Link2 className='w-3 h-3 mr-1' />
                  LINKS ({scrapedData.links?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value='images'
                  className='font-mono text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-black'
                >
                  <ImageIcon className='w-3 h-3 mr-1' />
                  IMAGES ({scrapedData.images?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value='metadata'
                  className='font-mono text-xs data-[state=active]:bg-orange-500 data-[state=active]:text-black'
                >
                  <Code className='w-3 h-3 mr-1' />
                  META
                </TabsTrigger>
              </TabsList>

              <TabsContent value='content' className='mt-4'>
                {scrapedData.description && (
                  <div className='mb-4 p-3 bg-zinc-950/50 rounded-lg'>
                    <span className='text-zinc-500 font-mono text-xs'>
                      DESCRIPTION
                    </span>
                    <p className='text-zinc-300 text-sm mt-1'>
                      {scrapedData.description}
                    </p>
                  </div>
                )}
                {scrapedData.content && (
                  <div className='p-3 bg-zinc-950/50 rounded-lg max-h-96 overflow-y-auto'>
                    <span className='text-zinc-500 font-mono text-xs'>
                      EXTRACTED TEXT
                    </span>
                    <p className='text-zinc-300 text-sm mt-2 whitespace-pre-wrap'>
                      {scrapedData.content}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='links' className='mt-4'>
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {scrapedData.links?.map((link, i) => (
                    <div
                      key={i}
                      className='flex items-center gap-2 p-2 bg-zinc-950/50 rounded'
                    >
                      <Link2 className='w-3 h-3 text-zinc-500 flex-shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='text-zinc-300 text-sm truncate'>
                          {link.text || '(no text)'}
                        </p>
                        <p className='text-zinc-600 text-xs font-mono truncate'>
                          {link.href}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!scrapedData.links || scrapedData.links.length === 0) && (
                    <p className='text-zinc-500 text-center py-4 font-mono text-sm'>
                      NO LINKS FOUND
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='images' className='mt-4'>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto'>
                  {scrapedData.images?.map((img, i) => (
                    <div
                      key={i}
                      className='bg-zinc-950/50 rounded overflow-hidden'
                    >
                      <div className='aspect-video bg-zinc-900 flex items-center justify-center'>
                        <img
                          src={img.src || '/placeholder.svg'}
                          alt={img.alt || 'Image'}
                          className='max-w-full max-h-full object-contain'
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display =
                              'none'
                          }}
                        />
                      </div>
                      <p className='text-zinc-500 text-xs p-2 truncate font-mono'>
                        {img.alt || img.src}
                      </p>
                    </div>
                  ))}
                  {(!scrapedData.images || scrapedData.images.length === 0) && (
                    <p className='text-zinc-500 text-center py-4 font-mono text-sm col-span-full'>
                      NO IMAGES FOUND
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='metadata' className='mt-4'>
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {scrapedData.metadata &&
                    Object.entries(scrapedData.metadata).map(
                      ([key, value], i) => (
                        <div
                          key={i}
                          className='flex items-start gap-2 p-2 bg-zinc-950/50 rounded'
                        >
                          <Badge
                            variant='outline'
                            className='border-zinc-700 text-zinc-400 font-mono text-xs flex-shrink-0'
                          >
                            {key}
                          </Badge>
                          <p className='text-zinc-300 text-sm break-all'>
                            {value}
                          </p>
                        </div>
                      )
                    )}
                  {(!scrapedData.metadata ||
                    Object.keys(scrapedData.metadata).length === 0) && (
                    <p className='text-zinc-500 text-center py-4 font-mono text-sm'>
                      NO METADATA FOUND
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CheerioScraper
