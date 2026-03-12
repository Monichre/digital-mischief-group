import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion'

type SceneTitleProps = {
  kicker: string
  title: string
  subtitle?: string
}

export function SceneTitle({kicker, title, subtitle}: SceneTitleProps) {
  const frame = useCurrentFrame()
  const {fps} = useVideoConfig()

  const settle = spring({
    fps,
    frame,
    config: {damping: 200, stiffness: 120},
  })

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#05070d',
        color: '#fff',
        textAlign: 'center',
        padding: 72,
      }}
    >
      <div style={{opacity, transform: `scale(${0.98 + settle * 0.02})`}}>
        <p style={{margin: 0, letterSpacing: 6, fontSize: 24, opacity: 0.75}}>{kicker}</p>
        <h1 style={{margin: '20px 0 12px', fontSize: 82, lineHeight: 1}}>{title}</h1>
        {subtitle ? <p style={{margin: 0, fontSize: 34, opacity: 0.9}}>{subtitle}</p> : null}
      </div>
    </AbsoluteFill>
  )
}
