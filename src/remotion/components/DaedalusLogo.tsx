import {brandPalette, brandTypography, type BrandLogoColor} from '../brand'

type LogoVariant = 'icon' | 'wordmark' | 'full'

type DaedalusLogoProps = {
  variant?: LogoVariant
  color?: BrandLogoColor
  size?: number
}

const logoColors: Record<BrandLogoColor, {fg: string; accent: string}> = {
  primary: {fg: brandPalette.primary, accent: brandPalette.highlight},
  white: {fg: '#ffffff', accent: brandPalette.highlight},
  black: {fg: '#05070d', accent: '#23365a'},
}

function LogoIcon({size, fg, accent}: {size: number; fg: string; accent: string}) {
  return (
    <svg width={size} height={size} viewBox='0 0 40 40' fill='none'>
      <rect x='2' y='2' width='36' height='36' rx='11' stroke={fg} strokeWidth='3' />
      <path d='M14 12L27 20L14 28V12Z' fill={accent} />
      <path d='M10 9V31' stroke={fg} strokeWidth='3' strokeLinecap='round' />
    </svg>
  )
}

function LogoWordmark({size, fg}: {size: number; fg: string}) {
  return (
    <svg width={size} height={size * 0.3} viewBox='0 0 320 96' fill='none'>
      <text
        x='0'
        y='72'
        fill={fg}
        style={{
          fontFamily: brandTypography.display,
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        DAEDALUS
      </text>
    </svg>
  )
}

export function DaedalusLogo({variant = 'full', color = 'primary', size = 40}: DaedalusLogoProps) {
  const {fg, accent} = logoColors[color]

  if (variant === 'icon') {
    return <LogoIcon size={size} fg={fg} accent={accent} />
  }

  if (variant === 'wordmark') {
    return <LogoWordmark size={size * 4} fg={fg} />
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.25}}>
      <LogoIcon size={size} fg={fg} accent={accent} />
      <LogoWordmark size={size * 4} fg={fg} />
    </div>
  )
}
