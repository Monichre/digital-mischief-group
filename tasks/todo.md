# OpenClawd Promotional Video Plan

## 1. Project Initialization
- [ ] Scaffold Remotion project using `npx create-video openclawd-promo` (Next.js or React template).
- [ ] Install required dependencies (`lucide-react`, `framer-motion` (or use Remotion's spring/interpolate), `tailwindcss` if needed).
- [ ] Configure `tailwind.config.js` with the specified color palette (#0c0a09 bg, #fbbf24 amber, etc.).
- [ ] Add font loading for Inter, SF Mono, and Georgia.

## 2. Global Assets & Configuration
- [ ] Add background music ("Walen - HEADPHONK") with `Audio` component, configuring `volume={0.4}` and fading in/out using `interpolate` over `frame`.
- [ ] Define the `Root` composition: `1080x700`, `30fps`, `1120` total frames (approx 37.33 seconds).

## 3. Scene Implementations (using `<Series>`)
All scenes should use a common `<AppWindow>` component for the macOS-like chrome (unless full screen). Transitions use spring animations with scale (0.95 -> 1 in, 1 -> 0.95 out) and opacity (0 -> 1 -> 0).

- [ ] **Scene 1: Terminal Install (120 frames)**
  - `<AppWindow>` wrapper. Slide in from bottom + 3D rotation (`rotateX(20deg)`).
  - Typing effect for `npx openclawd-cli` using `Math.min(frame, text.length)`.
  - Staggered server output text block (version, models, port).
- [ ] **Scene 2: Home Screen (150 frames)**
  - `<AppWindow>` wrapper.
  - Staggered spring fade-ins: Title (Georgia) -> Tagline -> Input -> Controls.
- [ ] **Scene 3: Chat Interface (160 frames)**
  - Three-column layout. Left (sidebar), Center (chat streaming), Right (tool call progress).
  - Animate text appearing in the center column.
  - Sequentially display right-column progress steps.
- [ ] **Scene 4: Provider Switch (130 frames)**
  - Two dropdown panels with staggered item reveals using `interpolate` and delays.
  - Left panel: Providers; Right panel: Models. Tagline at the bottom.
- [ ] **Scene 5: MCP Catalog (140 frames)**
  - Modal overlay UI with filter pills.
  - Grid of 6 server cards with icons and auth badges.
- [ ] **Scene 6: Messaging Bots (120 frames)**
  - Full-screen layout (no AppWindow).
  - Title & subtitle. 4 platform cards springing in.
- [ ] **Scene 7: Logo Combo (180 frames)**
  - Split into `<Sequence>` segments for Intro (burst/lines), "Introducing" text reveal, and Provider icons grid.
- [ ] **Scene 8: GitHub CTA (120 frames)**
  - Spinning GitHub logo (`rotate`), orbiting amber stars (using `Math.sin`/`Math.cos` over frame).
  - Pulsing text (scale mapped to a sine wave of the frame).

## 4. Review and Export
- [ ] Validate frame alignment and timings.
- [ ] Verify colors, fonts, and layout match specs.
- [ ] Provide commands to render the video.
