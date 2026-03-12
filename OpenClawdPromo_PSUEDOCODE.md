# OpenClawdPromo Pseudocode

## Global Configuration
```javascript
const COLORS = {
  bg: '#0c0a09',
  surfaces: '#1c1917',
  borders: '#292524',
  amber: '#fbbf24',
  white: '#fafaf9',
  muted: '#a8a29e',
  dim: '#78716c'
};

const DURATION_FRAMES = 1120; // 37.33s @ 30fps
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 700;
```

## Root Composition
```javascript
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="OpenClawdPromo"
        component={PromoVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
```

## PromoVideo Component
```javascript
export const PromoVideo = () => {
  const frame = useCurrentFrame();
  
  // Audio configuration with 1s fade-in, 2s fade-out at 40%
  const audioVolume = interpolate(
    frame,
    [0, 30, DURATION_FRAMES - 60, DURATION_FRAMES],
    [0, 0.4, 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, fontFamily: 'Inter' }}>
      <Audio src={staticFile("music/walen-headphonk.mp3")} volume={audioVolume} />
      
      <Series>
        <Series.Sequence durationInFrames={120}>
          <Scene1Terminal />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={150}>
          <Scene2Home />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={160}>
          <Scene3Chat />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={130}>
          <Scene4Providers />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={140}>
          <Scene5MCP />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={120}>
          <Scene6Messaging />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={180}>
          <Scene7Logo />
        </Series.Sequence>
        
        <Series.Sequence durationInFrames={120}>
          <Scene8GitHub />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
```

## Scene Transition Wrapper (Reusable)
```javascript
export const SceneTransition = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // Fade and scale in
  const scaleIn = spring({ fps: 30, frame, from: 0.95, to: 1, config: { damping: 12 } });
  const opacityIn = interpolate(frame, [0, 15], [0, 1]);
  
  // Fade and scale out (last 15 frames)
  const scaleOut = spring({ fps: 30, frame: frame - (durationInFrames - 15), from: 1, to: 0.95 });
  const opacityOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0]);

  const scale = frame > durationInFrames - 15 ? scaleOut : scaleIn;
  const opacity = frame > durationInFrames - 15 ? opacityOut : opacityIn;

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};
```

## AppWindow Wrapper
```javascript
export const AppWindow = ({ children, style }) => {
  return (
    <div style={{ 
      backgroundColor: COLORS.surfaces, 
      border: `1px solid ${COLORS.borders}`,
      borderRadius: '12px',
      ...style 
    }}>
      <TrafficLights />
      <Content>{children}</Content>
    </div>
  );
}
```

// Each Scene component will use the `SceneTransition` wrapper and implement its specific UI logic.
