import {AbsoluteFill, Series} from 'remotion'
import {TECHSTACK_BTS_SHOTS, TECHSTACK_OUTRO_BG} from '../assets'
import {SceneImageBeat} from '../scenes/SceneImageBeat'
import {SceneOutro} from '../scenes/SceneOutro'
import {SceneTitle} from '../scenes/SceneTitle'

const INTRO_FRAMES = 24
const BEAT_FRAMES = 34
const OUTRO_FRAMES = 24

export const TECHSTACK_BTS_DURATION =
  INTRO_FRAMES + TECHSTACK_BTS_SHOTS.length * BEAT_FRAMES + OUTRO_FRAMES

export function TechStackBTS_DayMinus2() {
  return (
    <AbsoluteFill style={{backgroundColor: '#05070d'}}>
      <Series>
        <Series.Sequence durationInFrames={INTRO_FRAMES}>
          <SceneTitle
            kicker='DAEDALUS // DAY -2'
            title='Tech Stack BTS'
            subtitle='Behind the primitive engine'
          />
        </Series.Sequence>

        {TECHSTACK_BTS_SHOTS.map((shot) => (
          <Series.Sequence key={`${shot.label}-${shot.src}`} durationInFrames={BEAT_FRAMES}>
            <SceneImageBeat src={shot.src} label={shot.label} caption={shot.caption} />
          </Series.Sequence>
        ))}

        <Series.Sequence durationInFrames={OUTRO_FRAMES}>
          <SceneOutro
            title='Shipping tomorrow'
            subtitle='Extract • Observe • Scout • Enrich • Agent'
            backgroundSrc={TECHSTACK_OUTRO_BG}
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  )
}
