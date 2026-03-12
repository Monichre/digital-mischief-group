export const brandPalette = {
  ink: '#05070d',
  inkRaised: '#0a1120',
  textPrimary: '#f5f7ff',
  textSecondary: '#b9c5e7',
  line: '#1f2a45',
  primary: '#7cc5ff',
  secondary: '#9b8cff',
  highlight: '#48f0ff',
} as const

export const brandTypography = {
  display: '"Share Tech Mono", "Inter", "SF Pro Display", "Segoe UI", sans-serif',
  body: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
  mono: '"Share Tech Mono", "JetBrains Mono", "Menlo", monospace',
} as const

export const brandGradients = {
  hero: 'radial-gradient(circle at 20% 10%, rgba(124,197,255,0.2) 0%, rgba(5,7,13,0.95) 60%), linear-gradient(135deg, #05070d 0%, #0a1120 55%, #11152b 100%)',
  overlay: 'linear-gradient(180deg, rgba(5,7,13,0.08) 30%, rgba(5,7,13,0.85) 100%)',
  accent: 'linear-gradient(90deg, #7cc5ff 0%, #48f0ff 100%)',
} as const

export const brandMotion = {
  titleDamping: 180,
  titleStiffness: 120,
  imageZoomFrom: 1.08,
  imageZoomTo: 1,
  fadeInFrames: 10,
} as const

export const brandSafeZone = {
  horizontal: 56,
  vertical: 56,
} as const

export type BrandLogoColor = 'primary' | 'white' | 'black'
