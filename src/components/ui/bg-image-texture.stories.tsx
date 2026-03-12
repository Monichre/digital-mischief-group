import { BackgroundImageTexture } from '@/components/ui/bg-image-texture'

const textureVariants = [
  'fabric-of-squares',
  'grid-noise',
  'inflicted',
  'debut-light',
  'groovepaper',
  'none',
] as const

const meta = {
  title: 'UI/BackgroundImageTexture',
  component: BackgroundImageTexture,
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const Default = {
  render: () => (
    <BackgroundImageTexture
      variant="fabric-of-squares"
      opacity={0.28}
      className="overflow-hidden rounded-2xl border bg-zinc-950 p-6 text-zinc-50"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Background texture
        </p>
        <h3 className="text-xl font-semibold">
          Operational interface with subtle grit
        </h3>
        <p className="max-w-md text-sm text-zinc-300">
          Use an overlay texture when a surface needs more character
          without sacrificing legibility.
        </p>
      </div>
    </BackgroundImageTexture>
  ),
}

export const Gallery = {
  render: () => (
    <div className="grid max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3">
      {textureVariants.map((variant) => (
        <BackgroundImageTexture
          key={variant}
          variant={variant}
          opacity={variant === 'none' ? 1 : 0.22}
          className="overflow-hidden rounded-xl border bg-zinc-950 p-4 text-zinc-50"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              {variant}
            </p>
            <div className="h-24 rounded-md border border-white/10 bg-white/5" />
          </div>
        </BackgroundImageTexture>
      ))}
    </div>
  ),
}
