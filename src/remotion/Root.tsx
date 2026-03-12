import {Composition} from 'remotion'
import {AgentTeaser_DayMinus3, AGENT_TEASER_DURATION} from './compositions/AgentTeaser_DayMinus3'
import {TechStackBTS_DayMinus2, TECHSTACK_BTS_DURATION} from './compositions/TechStackBTS_DayMinus2'
import {VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH} from './constants'

export function RemotionRoot() {
  return (
    <>
      <Composition
        id='AgentTeaser-DayMinus3'
        component={AgentTeaser_DayMinus3}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        durationInFrames={AGENT_TEASER_DURATION}
      />

      <Composition
        id='TechStackBTS-DayMinus2'
        component={TechStackBTS_DayMinus2}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        durationInFrames={TECHSTACK_BTS_DURATION}
      />
    </>
  )
}
