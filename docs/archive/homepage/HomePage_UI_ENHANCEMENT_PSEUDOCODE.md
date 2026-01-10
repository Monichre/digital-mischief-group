# Homepage UI Enhancement - Technical Pseudocode

## Component Architecture Overview

```
app/page.tsx
├── Layout Container
│   ├── <NoiseOverlay />           // Fixed grain texture
│   ├── <ScanlineOverlay />        // CRT effect
│   ├── <CursorGlow />             // Custom cursor (client-only)
│   └── Main Content
│       ├── <AnimatedGridBG />     // Living grid background
│       ├── <Navigation />
│       ├── <HeroSection />
│       │   ├── <HUDCorners />
│       │   ├── <HoloTitle />
│       │   ├── <FloatingStatus />
│       │   └── <ParticleField />
│       ├── <ProblemSection />
│       ├── <WarningSection />
│       ├── <SolutionSection />
│       │   └── <IntelCard /> × 4
│       ├── <ProcessSection />
│       │   └── <CircuitTimeline />
│       ├── <TeamSection />
│       │   └── <DossierCard /> × N
│       ├── <FooterCTA />
│       └── <Footer />
```

---

## 1. NoiseOverlay Component

### Purpose

Adds analog film grain texture across entire viewport

### Pseudocode

```typescript
// components/effects/NoiseOverlay.tsx

COMPONENT NoiseOverlay:
  // SVG noise pattern encoded as data URI
  CONST noisePattern = generateNoiseDataURI()
  
  RETURN (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        backgroundImage: `url(${noisePattern})`,
        backgroundRepeat: 'repeat',
        opacity: 0.04,
        mixBlendMode: 'overlay'
      }}
    />
  )

FUNCTION generateNoiseDataURI():
  // Create SVG with feTurbulence filter
  svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="1" />
    </svg>
  `
  RETURN `data:image/svg+xml;base64,${btoa(svgContent)}`
```

---

## 2. ScanlineOverlay Component

### Purpose

CRT scanline effect for retro-tech atmosphere

### Pseudocode

```typescript
// components/effects/ScanlineOverlay.tsx

COMPONENT ScanlineOverlay:
  RETURN (
    <div 
      className="fixed inset-0 pointer-events-none z-[9998]"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 2px,
          rgba(0, 0, 0, 0.03) 2px,
          rgba(0, 0, 0, 0.03) 4px
        )`
      }}
    />
  )
```

---

## 3. CursorGlow Component

### Purpose

Custom cursor with trailing glow effect

### Pseudocode

```typescript
// components/effects/CursorGlow.tsx

COMPONENT CursorGlow:
  STATE cursorPos = { x: 0, y: 0 }
  STATE trail: Array<{x, y, opacity}> = []
  
  EFFECT onMount:
    ADD event listener for mousemove:
      UPDATE cursorPos with mouse coordinates
      PUSH new position to trail (max 20 items)
      REMOVE oldest positions if trail > 20
    
    REQUEST animation frame loop:
      FOR EACH position in trail:
        REDUCE opacity by 0.05
        IF opacity <= 0: REMOVE from trail
  
  RETURN (
    <>
      // Trail dots
      {trail.map((point) => (
        <div 
          key={point.id}
          className="fixed w-2 h-2 rounded-full bg-orange-500 pointer-events-none"
          style={{
            left: point.x,
            top: point.y,
            opacity: point.opacity,
            transform: 'translate(-50%, -50%)',
            filter: `blur(${(1 - point.opacity) * 4}px)`
          }}
        />
      ))}
      
      // Main cursor glow
      <div
        className="fixed w-8 h-8 rounded-full pointer-events-none z-[10000]"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
    </>
  )
```

---

## 4. HoloText Component

### Purpose

Holographic text with chromatic aberration and glitch

### Pseudocode

```typescript
// components/effects/HoloText.tsx

INTERFACE HoloTextProps:
  text: string
  className?: string
  glitchInterval?: number // ms between glitches

COMPONENT HoloText({ text, className, glitchInterval = 5000 }):
  STATE isGlitching = false
  
  EFFECT onMount:
    SET interval every glitchInterval:
      SET isGlitching = true
      AFTER 200ms: SET isGlitching = false
  
  RETURN (
    <span 
      className={cn("relative inline-block", className)}
      data-text={text}
    >
      // Cyan offset layer (behind)
      <span 
        aria-hidden="true"
        className="absolute inset-0 text-cyan-400 opacity-80"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          transform: isGlitching ? 'translateX(-3px)' : 'translateX(-1px)',
          transition: 'transform 0.1s'
        }}
      >
        {text}
      </span>
      
      // Red offset layer (behind)
      <span 
        aria-hidden="true"
        className="absolute inset-0 text-red-400 opacity-80"
        style={{
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          transform: isGlitching ? 'translateX(3px)' : 'translateX(1px)',
          transition: 'transform 0.1s'
        }}
      >
        {text}
      </span>
      
      // Main text layer (front)
      <span className="relative">
        {text}
      </span>
    </span>
  )
```

---

## 5. HUDCorners Component

### Purpose

Animated corner brackets with status indicators

### Pseudocode

```typescript
// components/effects/HUDCorners.tsx

INTERFACE HUDCornersProps:
  children: ReactNode
  status?: 'online' | 'scanning' | 'alert'
  showCoords?: boolean

COMPONENT HUDCorners({ children, status = 'online', showCoords }):
  STATE coords = { lat: '37.7749', lng: '-122.4194' }
  STATE timestamp = getCurrentTimestamp()
  
  EFFECT onMount:
    SET interval every 1000ms:
      UPDATE timestamp
  
  RETURN (
    <div className="relative">
      // Top-left corner
      <div className="absolute -top-4 -left-4">
        <svg className="w-8 h-8">
          <path 
            d="M0 24 L0 4 L4 0 L24 0" 
            stroke="currentColor" 
            strokeWidth="1"
            fill="none"
            className="text-orange-500/50"
          />
        </svg>
        {showCoords && (
          <span className="absolute top-8 left-0 text-[8px] text-orange-500/50 font-mono">
            {coords.lat}° N
          </span>
        )}
      </div>
      
      // Top-right corner (mirrored)
      // ... similar structure
      
      // Bottom-left corner
      // ... similar structure
      
      // Bottom-right corner
      // ... similar structure
      
      // Status indicator
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="text-[8px] font-mono text-orange-500/70 tracking-widest">
          {status.toUpperCase()}
        </span>
        <div className={cn(
          "w-2 h-2 rounded-full mx-auto mt-1",
          status === 'online' && "bg-green-500 animate-pulse",
          status === 'scanning' && "bg-orange-500 animate-ping",
          status === 'alert' && "bg-red-500 animate-pulse"
        )} />
      </div>
      
      // Timestamp
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
        <span className="text-[8px] font-mono text-zinc-600">
          {timestamp}
        </span>
      </div>
      
      // Children content
      {children}
    </div>
  )
```

---

## 6. IntelCard Component

### Purpose

Glassmorphism card with animated border and status LED

### Pseudocode

```typescript
// components/ui/IntelCard.tsx

INTERFACE IntelCardProps:
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  classification?: 'classified' | 'secret' | 'top-secret'

COMPONENT IntelCard({ icon: Icon, title, subtitle, description, classification }):
  STATE isHovered = false
  REF cardRef = useRef()
  STATE mousePos = { x: 0, y: 0 }
  
  FUNCTION handleMouseMove(e):
    GET card bounds from cardRef
    CALCULATE relative mouse position within card
    UPDATE mousePos
  
  RETURN (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => SET isHovered = true}
      onMouseLeave={() => SET isHovered = false}
      className="relative group"
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      // Animated gradient border
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(
            300px circle at ${mousePos.x}px ${mousePos.y}px,
            rgba(249, 115, 22, 0.15),
            transparent 60%
          )`
        }}
      />
      
      // Glass background
      <div className="relative p-8 rounded-lg border border-white/5 bg-zinc-900/70 backdrop-blur-xl overflow-hidden">
        
        // Corner cuts (clip-path)
        <div className="absolute top-0 right-0 w-8 h-8 bg-zinc-950" 
          style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} 
        />
        
        // Classification badge
        {classification && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-mono text-red-400 uppercase tracking-widest">
              {classification}
            </span>
          </div>
        )}
        
        // Icon with glow
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute inset-0 bg-orange-500/20 rounded-lg blur-xl" />
          <div className="relative w-full h-full border border-orange-500/30 rounded-lg flex items-center justify-center bg-zinc-950">
            <Icon className="w-7 h-7 text-orange-500" />
          </div>
        </div>
        
        // Content
        <div className="text-[10px] text-orange-500/70 font-mono uppercase tracking-widest mb-1">
          {subtitle}
        </div>
        <h3 className="text-xl font-bold text-zinc-100 mb-3">
          {title}
        </h3>
        <div className="h-px w-12 bg-gradient-to-r from-orange-500/50 to-transparent mb-3" />
        <p className="text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
        
        // Scanline decoration
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/50 to-transparent" />
      </div>
    </motion.div>
  )
```

---

## 7. CircuitDivider Component

### Purpose

Animated circuit-like section divider

### Pseudocode

```typescript
// components/effects/CircuitDivider.tsx

COMPONENT CircuitDivider:
  STATE isVisible = false
  REF containerRef = useRef()
  
  EFFECT onMount:
    CREATE intersection observer
    WHEN container enters viewport:
      SET isVisible = true
  
  RETURN (
    <div ref={containerRef} className="relative h-16 w-full overflow-hidden">
      // Center node
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 border border-orange-500 rotate-45 bg-zinc-950">
          <div className={cn(
            "w-1.5 h-1.5 bg-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0"
          )} />
        </div>
      </div>
      
      // Left line
      <div 
        className={cn(
          "absolute top-1/2 right-1/2 h-px bg-gradient-to-l from-orange-500/50 to-transparent origin-right transition-transform duration-1000",
          isVisible ? "scale-x-100" : "scale-x-0"
        )}
        style={{ width: 'calc(50% - 20px)' }}
      />
      
      // Right line
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-orange-500/50 to-transparent origin-left transition-transform duration-1000 delay-200",
          isVisible ? "scale-x-100" : "scale-x-0"
        )}
        style={{ width: 'calc(50% - 20px)' }}
      />
      
      // Data pulse animation (travels along line)
      {isVisible && (
        <>
          <motion.div
            className="absolute top-1/2 w-8 h-px bg-orange-500"
            initial={{ right: '50%', opacity: 0 }}
            animate={{ right: '100%', opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.div
            className="absolute top-1/2 w-8 h-px bg-orange-500"
            initial={{ left: '50%', opacity: 0 }}
            animate={{ left: '100%', opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatDelay: 3 }}
          />
        </>
      )}
    </div>
  )
```

---

## 8. AnimatedGridBG Component

### Purpose

Canvas-based animated background grid

### Pseudocode

```typescript
// components/effects/AnimatedGridBG.tsx

COMPONENT AnimatedGridBG:
  REF canvasRef = useRef()
  STATE mousePos = { x: 0, y: 0 }
  
  EFFECT onMount:
    GET canvas context
    GET device pixel ratio for sharp rendering
    SET canvas size to window dimensions × pixel ratio
    
    DEFINE grid:
      cellSize = 60
      cols = Math.ceil(width / cellSize)
      rows = Math.ceil(height / cellSize)
    
    FUNCTION draw():
      CLEAR canvas
      
      FOR each cell (col, row):
        CALCULATE cell center position
        CALCULATE distance from mousePos
        
        // Cells near mouse are brighter
        brightness = MAP distance (0 to 400px) to opacity (0.15 to 0.02)
        
        // Draw cell dot
        SET fill color = rgba(249, 115, 22, brightness)
        DRAW circle at cell center, radius 1
        
        // Draw grid lines (very subtle)
        IF col < cols - 1:
          DRAW horizontal line from current to next cell
        IF row < rows - 1:
          DRAW vertical line from current to cell below
      
      REQUEST next animation frame
    
    START animation loop
    ADD mousemove listener to update mousePos
    ADD resize listener to update canvas size
  
  RETURN (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
```

---

## 9. FloatingStatus Component

### Purpose

HUD-style floating status elements around hero

### Pseudocode

```typescript
// components/effects/FloatingStatus.tsx

COMPONENT FloatingStatus:
  STATE systemTime = new Date()
  STATE metrics = {
    threats: Math.floor(Math.random() * 15),
    uptime: '99.97%',
    latency: '12ms'
  }
  
  EFFECT onMount:
    SET interval every 1000ms:
      UPDATE systemTime
    
    SET interval every 5000ms:
      UPDATE metrics with new random values
  
  RETURN (
    <>
      // Top-left status block
      <div className="absolute top-20 left-10 font-mono text-[10px] text-zinc-600 space-y-1 opacity-50">
        <div>SYS.TIME: {formatTime(systemTime)}</div>
        <div>UPTIME: {metrics.uptime}</div>
        <div className="text-orange-500">THREATS.DETECTED: {metrics.threats}</div>
      </div>
      
      // Top-right status block
      <div className="absolute top-20 right-10 font-mono text-[10px] text-zinc-600 text-right space-y-1 opacity-50">
        <div>LAT: 37.7749° N</div>
        <div>LNG: 122.4194° W</div>
        <div>LATENCY: {metrics.latency}</div>
      </div>
      
      // Scrolling data stream (left edge)
      <div className="absolute left-0 top-1/3 bottom-1/3 w-px overflow-hidden opacity-30">
        <motion.div
          className="w-full bg-gradient-to-b from-transparent via-orange-500 to-transparent"
          style={{ height: '200%' }}
          animate={{ y: ['-50%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      
      // Similar for right edge
    </>
  )
```

---

## 10. CSS Enhancements (globals.css)

### Pseudocode

```css
/* app/globals.css additions */

/* Typography */
@layer base {
  :root {
    --font-display: 'GeistSans', system-ui, sans-serif;
    --font-mono: 'GeistMono', 'JetBrains Mono', monospace;
    
    /* Glow effects */
    --glow-orange: 0 0 40px rgba(249, 115, 22, 0.4);
    --glow-orange-intense: 0 0 60px rgba(249, 115, 22, 0.6), 0 0 100px rgba(249, 115, 22, 0.3);
    
    /* Glass effects */
    --glass-bg: rgba(24, 24, 27, 0.7);
    --glass-border: rgba(255, 255, 255, 0.05);
  }
}

/* Animations */
@keyframes glitch-horizontal {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px); }
  20% { transform: translateX(2px); }
  30% { transform: translateX(-1px); }
  40% { transform: translateX(1px); }
  50% { transform: translateX(0); }
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}

@keyframes data-pulse {
  0% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: translateX(100%); }
}

@keyframes border-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* Utility classes */
.text-glow-orange {
  text-shadow: var(--glow-orange);
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.animate-glitch {
  animation: glitch-horizontal 0.3s ease-in-out;
}

.border-animated {
  background: linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent);
  background-size: 200% 100%;
  animation: border-flow 3s linear infinite;
}

/* Button glow effect */
.btn-glow {
  position: relative;
}
.btn-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(90deg, #f97316, #ea580c, #f97316);
  border-radius: inherit;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}
.btn-glow:hover::before {
  opacity: 0.6;
}
```

---

## Integration into page.tsx

### Pseudocode

```typescript
// app/page.tsx (enhanced structure)

IMPORT all new components

COMPONENT Home:
  // ... existing state ...
  
  RETURN (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      
      // === ATMOSPHERIC LAYERS ===
      <NoiseOverlay />
      <ScanlineOverlay />
      <AnimatedGridBG />
      <CursorGlow /> // Only on desktop, detect with useMediaQuery
      
      // === NAVIGATION (enhanced) ===
      <nav className="fixed ... backdrop-blur-xl bg-zinc-950/60">
        // ... add progress indicator based on scroll
      </nav>
      
      // === HERO SECTION ===
      <section className="relative min-h-screen ...">
        <FloatingStatus />
        
        <HUDCorners status="online" showCoords>
          <HoloText 
            text="DIGITAL MISCHIEF" 
            className="text-6xl font-black"
          />
        </HUDCorners>
        
        // ... rest of hero content with enhanced animations
      </section>
      
      <CircuitDivider />
      
      // === PROBLEM SECTION ===
      // ... enhanced cards
      
      <CircuitDivider />
      
      // === SOLUTION SECTION ===
      <section>
        <StaggerReveal className="grid grid-cols-2 gap-6">
          {capabilities.map((item) => (
            <IntelCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              description={item.desc}
              classification="classified"
            />
          ))}
        </StaggerReveal>
      </section>
      
      // ... continue with other enhanced sections
      
    </div>
  )
```

---

## Performance Optimization Notes

1. **Lazy load heavy components:**

   ```typescript
   const AnimatedGridBG = dynamic(() => import('./AnimatedGridBG'), {
     ssr: false,
     loading: () => <div className="fixed inset-0 bg-zinc-950" />
   })
   ```

2. **Reduce motion for accessibility:**

   ```typescript
   const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
   
   if (prefersReducedMotion) {
     // Disable particle effects, glitch animations, etc.
   }
   ```

3. **Throttle mouse events:**

   ```typescript
   const throttledMouseMove = useMemo(
     () => throttle((e) => setMousePos({ x: e.clientX, y: e.clientY }), 16),
     []
   )
   ```

4. **Use CSS transforms, not layout properties:**
   - ✅ `transform: translateX(10px)`
   - ❌ `left: 10px` (triggers layout)

5. **Canvas optimization:**
   - Use `requestAnimationFrame` for smooth animation
   - Only redraw changed regions when possible
   - Use `will-change: transform` sparingly

---

*End of pseudocode documentation*
