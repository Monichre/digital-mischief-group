import {AbsoluteFill, Series} from 'remotion'
import {AGENT_OUTRO_BG, AGENT_TEASER_SHOTS} from '../assets'
import {SceneImageBeat} from '../scenes/SceneImageBeat'
import {SceneOutro} from '../scenes/SceneOutro'
import {SceneTitle} from '../scenes/SceneTitle'

const INTRO_FRAMES = 24
const BEAT_FRAMES = 34
const OUTRO_FRAMES = 24

export const AGENT_TEASER_DURATION =
  INTRO_FRAMES + AGENT_TEASER_SHOTS.length * BEAT_FRAMES + OUTRO_FRAMES

export function AgentTeaser_DayMinus3() {
  return (
    <AbsoluteFill style={{backgroundColor: '#05070d'}}>
      <Series>
        <Series.Sequence durationInFrames={INTRO_FRAMES}>
          <SceneTitle
            kicker='DAEDALUS // DAY -3'
            title='Agent Teaser'
            subtitle='Mission preview'
          />
        </Series.Sequence>

        {AGENT_TEASER_SHOTS.map((shot) => (
          <Series.Sequence key={`${shot.label}-${shot.src}`} durationInFrames={BEAT_FRAMES}>
            <SceneImageBeat src={shot.src} label={shot.label} caption={shot.caption} />
          </Series.Sequence>
        ))}

        <Series.Sequence durationInFrames={OUTRO_FRAMES}>
          <SceneOutro
            title='Launch in 3 days'
            subtitle='Agent sessions go live soon'
            backgroundSrc={AGENT_OUTRO_BG}
          />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  )
}
