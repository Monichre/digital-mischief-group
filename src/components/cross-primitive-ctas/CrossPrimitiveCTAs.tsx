'use client'

import {useState} from 'react'
import {
  Shield,
  Crosshair,
  Sparkles,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'

export interface CrossPrimitiveContext {
  // From enrichment or brand extraction
  companyName?: string
  domain?: string
  website?: string
  industry?: string
  description?: string
  // For asset generation
  brandColors?: string[]
  logo?: string
}

interface CrossPrimitiveCTAsProps {
  context: CrossPrimitiveContext
  className?: string
  variant?: 'horizontal' | 'vertical'
}

interface CreateScoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: CrossPrimitiveContext
}

interface CreateMonitorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: CrossPrimitiveContext
}

interface GenerateAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: CrossPrimitiveContext
}

function CreateScoutDialog({open, onOpenChange, context}: CreateScoutDialogProps) {
  const [name, setName] = useState(`${context.companyName || 'Company'} Scout`)
  const [query, setQuery] = useState(
    context.companyName
      ? `"${context.companyName}" OR site:${context.domain || context.website || ''}`
      : ''
  )
  const [isCreating, setIsCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim() || !query.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: name.trim(),
          search_query: query.trim(),
          schedule: 'manual',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create scout')
      }

      const data = await response.json()
      setCreatedId(data.scout?.id)
      setCreated(true)
    } catch (error) {
      console.error('Failed to create scout:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setCreated(false)
      setCreatedId(null)
      setName(`${context.companyName || 'Company'} Scout`)
      setQuery(
        context.companyName
          ? `"${context.companyName}" OR site:${context.domain || context.website || ''}`
          : ''
      )
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-zinc-100">
                <Shield className="w-5 h-5 text-orange-500" />
                Create Scout
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Deploy a sentinel to monitor web mentions and competitive signals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block font-mono">
                  SCOUT NAME
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Competitor Pricing Monitor"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block font-mono">
                  SEARCH QUERY
                </label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='e.g., "acme corp" pricing OR plans'
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
                <p className="text-xs text-zinc-600 mt-1.5">
                  Use quotes for exact phrases, OR for alternatives
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !name.trim() || !query.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Scout'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Scout Deployed!</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Your sentinel is ready to monitor &quot;{name}&quot;
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              >
                Close
              </Button>
              {createdId && (
                <Link href={`/scouts/${createdId}`}>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-black font-bold">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Scout
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CreateMonitorDialog({open, onOpenChange, context}: CreateMonitorDialogProps) {
  const baseUrl = context.website || (context.domain ? `https://${context.domain}` : '')
  const [name, setName] = useState(`${context.companyName || 'Page'} Monitor`)
  const [url, setUrl] = useState(baseUrl)
  const [isCreating, setIsCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create monitor')
      }

      const data = await response.json()
      setCreatedId(data.monitor?.id)
      setCreated(true)
    } catch (error) {
      console.error('Failed to create monitor:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setCreated(false)
      setCreatedId(null)
      setName(`${context.companyName || 'Page'} Monitor`)
      setUrl(baseUrl)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-zinc-100">
                <Crosshair className="w-5 h-5 text-orange-500" />
                Create Monitor
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                Track changes on a specific URL and get AI-powered summaries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block font-mono">
                  MONITOR NAME
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Competitor Pricing Page"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block font-mono">
                  URL TO MONITOR
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/pricing"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
                />
                <p className="text-xs text-zinc-600 mt-1.5">
                  Monitor pricing, features, or policy pages for changes
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !name.trim() || !url.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Deploy Monitor'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-2">Monitor Deployed!</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Now tracking &quot;{name}&quot; for changes
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              >
                Close
              </Button>
              {createdId && (
                <Link href={`/observe/${createdId}`}>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-black font-bold">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Monitor
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function GenerateAssetDialog({open, onOpenChange, context}: GenerateAssetDialogProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const assetTypes = [
    {id: 'email', name: 'Email Template', description: 'Brand-consistent outreach emails'},
    {id: 'landing', name: 'Landing Page', description: 'Conversion-optimized page copy'},
    {id: 'social', name: 'Social Posts', description: 'Platform-specific social content'},
  ]

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (selectedAssets.length === 0) return
    setIsGenerating(true)
    // TODO: T-010 - Implement actual asset generation
    // For now, just simulate a delay and close
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsGenerating(false)
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSelectedAssets([])
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-100">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Generate Asset Pack
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create brand-consistent marketing assets from extracted identity.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {context.companyName && (
            <div className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded">
              <p className="text-xs text-zinc-500 mb-1">GENERATING FOR</p>
              <p className="text-sm font-medium text-zinc-200">{context.companyName}</p>
            </div>
          )}

          <p className="text-xs text-zinc-500 mb-3 font-mono">SELECT ASSET TYPES</p>
          <div className="space-y-2">
            {assetTypes.map((asset) => (
              <button
                key={asset.id}
                onClick={() => toggleAsset(asset.id)}
                className={`w-full p-3 text-left border rounded transition-colors ${
                  selectedAssets.includes(asset.id)
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{asset.name}</p>
                    <p className="text-xs text-zinc-500">{asset.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedAssets.includes(asset.id)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-zinc-600'
                    }`}
                  >
                    {selectedAssets.includes(asset.id) && (
                      <Check className="w-3 h-3 text-black" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedAssets.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate ({selectedAssets.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CrossPrimitiveCTAs({
  context,
  className = '',
  variant = 'horizontal',
}: CrossPrimitiveCTAsProps) {
  const [showScoutDialog, setShowScoutDialog] = useState(false)
  const [showMonitorDialog, setShowMonitorDialog] = useState(false)
  const [showAssetDialog, setShowAssetDialog] = useState(false)

  const containerClass =
    variant === 'horizontal'
      ? 'flex flex-wrap items-center gap-2'
      : 'flex flex-col gap-2'

  return (
    <>
      <div className={`${containerClass} ${className}`}>
        {/* Create Scout CTA */}
        <button
          onClick={() => setShowScoutDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors text-sm font-mono group"
        >
          <Shield className="w-4 h-4 text-orange-500 group-hover:animate-pulse" />
          <span className="text-zinc-300">Create Scout</span>
        </button>

        {/* Create Monitor CTA */}
        <button
          onClick={() => setShowMonitorDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors text-sm font-mono group"
        >
          <Crosshair className="w-4 h-4 text-orange-500 group-hover:animate-pulse" />
          <span className="text-zinc-300">Create Monitor</span>
        </button>

        {/* Generate Asset Pack CTA */}
        <button
          onClick={() => setShowAssetDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-colors text-sm font-mono group"
        >
          <Sparkles className="w-4 h-4 text-orange-500 group-hover:animate-pulse" />
          <span className="text-zinc-300">Generate Assets</span>
        </button>
      </div>

      {/* Dialogs */}
      <CreateScoutDialog
        open={showScoutDialog}
        onOpenChange={setShowScoutDialog}
        context={context}
      />
      <CreateMonitorDialog
        open={showMonitorDialog}
        onOpenChange={setShowMonitorDialog}
        context={context}
      />
      <GenerateAssetDialog
        open={showAssetDialog}
        onOpenChange={setShowAssetDialog}
        context={context}
      />
    </>
  )
}
