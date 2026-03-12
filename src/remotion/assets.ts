import shot01 from '../../video-assets/01-terminal-boot.jpeg'
import shot02 from '../../video-assets/02-war-games-dashboard.jpeg'
import shot03 from '../../video-assets/03-ghost-protocol.jpeg'
import shot04 from '../../video-assets/04-swarm-engine.jpeg'
import shot05 from '../../video-assets/05-target-dossier.jpeg'
import shot06 from '../../video-assets/06-black-ops-toggle.jpeg'
import shot07 from '../../video-assets/07-the-verdict.jpeg'
import shot08 from '../../video-assets/08-cta-logo.jpeg'

type ImportedAsset = string | {src: string}

const toSrc = (asset: ImportedAsset): string => {
  return typeof asset === 'string' ? asset : asset.src
}

export type TeaserShot = {
  src: string
  label: string
  caption: string
}

export const AGENT_TEASER_SHOTS: TeaserShot[] = [
  {
    src: toSrc(shot01),
    label: 'BOOT SEQUENCE',
    caption: 'Agent stack warming up.',
  },
  {
    src: toSrc(shot02),
    label: 'MISSION BOARD',
    caption: 'Targets, signals, and timing in one view.',
  },
  {
    src: toSrc(shot03),
    label: 'GHOST PROTOCOL',
    caption: 'Stealth research with traceable outputs.',
  },
]

export const TECHSTACK_BTS_SHOTS: TeaserShot[] = [
  {
    src: toSrc(shot04),
    label: 'SWARM ENGINE',
    caption: 'Parallel collection over shared primitives.',
  },
  {
    src: toSrc(shot05),
    label: 'DOSSIER PIPELINE',
    caption: 'Structured enrich flow from web evidence.',
  },
  {
    src: toSrc(shot06),
    label: 'OPS CONTROLS',
    caption: 'Fast toggles for run mode and depth.',
  },
]

export const AGENT_OUTRO_BG = toSrc(shot08)
export const TECHSTACK_OUTRO_BG = toSrc(shot07)
