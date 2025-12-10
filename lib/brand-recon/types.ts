// Brand Recon TypeScript Types
// Based on Firecrawl branding format response structure

export interface BrandColors {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  textPrimary?: string
  textSecondary?: string
  link?: string
  success?: string
  warning?: string
  error?: string
}

export interface BrandFont {
  family: string
}

export interface BrandTypography {
  fontFamilies?: {
    primary?: string
    heading?: string
    code?: string
  }
  fontSizes?: {
    h1?: string
    h2?: string
    h3?: string
    body?: string
  }
  fontWeights?: {
    light?: number
    regular?: number
    medium?: number
    bold?: number
  }
  lineHeights?: {
    heading?: string
    body?: string
  }
}

export interface BrandSpacing {
  baseUnit?: number
  borderRadius?: string
  padding?: Record<string, string>
  margins?: Record<string, string>
}

export interface BrandButtonStyle {
  background?: string
  textColor?: string
  borderColor?: string
  borderRadius?: string
}

export interface BrandInputStyle {
  background?: string
  borderColor?: string
  borderRadius?: string
  textColor?: string
}

export interface BrandComponents {
  buttonPrimary?: BrandButtonStyle
  buttonSecondary?: BrandButtonStyle
  input?: BrandInputStyle
  icons?: {
    style?: string
    size?: string
  }
}

export interface BrandImages {
  logo?: string
  favicon?: string
  ogImage?: string
}

export interface BrandAnimations {
  duration?: string
  easing?: string
  hover?: Record<string, string>
}

export interface BrandLayout {
  grid?: {
    columns?: number
    gap?: string
  }
  headerHeight?: string
  footerHeight?: string
}

export interface BrandPersonality {
  tone?: string
  energy?: string
  targetAudience?: string
}

export interface BrandingProfile {
  colorScheme?: "light" | "dark"
  logo?: string
  colors?: BrandColors
  fonts?: BrandFont[]
  typography?: BrandTypography
  spacing?: BrandSpacing
  components?: BrandComponents
  images?: BrandImages
  animations?: BrandAnimations
  layout?: BrandLayout
  personality?: BrandPersonality
}

export interface BrandReconResponse {
  success: boolean
  data?: {
    branding: BrandingProfile
    metadata?: {
      title?: string
      description?: string
      sourceURL?: string
      statusCode?: number
    }
  }
  error?: string
}

export type ReconStatus = "idle" | "loading" | "success" | "error"
