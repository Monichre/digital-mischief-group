import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion'

type SceneImageBeatProps = {
  src: string
  label: string
  caption: string
}

export function SceneImageBeat({src, label, caption}: SceneImageBeatProps) {
  const frame = useCurrentFrame()

  const scale = interpolate(frame, [0, 34], [1.06, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const captionOpacity = interpolate(frame, [0, 8, 20], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const captionY = interpolate(frame, [0, 12], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill style={{backgroundColor: '#05070d'}}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: 'brightness(0.72)',
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          padding: 56,
          backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.72) 100%)',
        }}
      >
        <div style={{opacity: captionOpacity, transform: `translateY(${captionY}px)`}}>
          <p style={{margin: 0, color: '#9cc8ff', letterSpacing: 3, fontSize: 22}}>{label}</p>
          <p style={{margin: '10px 0 0', color: '#fff', fontSize: 40, lineHeight: 1.15}}>{caption}</p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
