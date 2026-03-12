import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion'

type SceneOutroProps = {
  title: string
  subtitle: string
  backgroundSrc?: string
}

export function SceneOutro({title, subtitle, backgroundSrc}: SceneOutroProps) {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{backgroundColor: '#05070d', color: '#fff'}}>
      {backgroundSrc ? (
        <Img
          src={backgroundSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            filter: 'brightness(0.7)',
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: 72,
          opacity,
          background: 'radial-gradient(circle at center, rgba(20,35,65,0.35) 0%, rgba(5,7,13,0.88) 65%)',
        }}
      >
        <h2 style={{margin: 0, fontSize: 68, lineHeight: 1.05}}>{title}</h2>
        <p style={{margin: '18px 0 0', fontSize: 30, opacity: 0.9}}>{subtitle}</p>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
