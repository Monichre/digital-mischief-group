# DMG Brand System - Cursor Rules

## Overview
This document defines patterns and best practices for implementing brand identity extraction and design system features based on the **Digital Mischief Group** marketing site and brand system patterns.

**Source**: https://www.digitalmischiefgroup.com/
**Repository**: https://github.com/Monichre/digital-mischief-group (customer zero implementation)

## Core Concept
The DMG brand system emphasizes:
- **Cyberpunk/Neon aesthetic** with dark themes and vibrant accents
- **Military-industrial complex** visual language (tactical, high-tech)
- **Monospace typography** for technical/code aesthetics
- **Hacker/skunkworks** positioning ("ideas lab with matches")
- **High-contrast** UI with orange/green/blue accent colors
- **Tactical terminology** (arsenal, intel, protocols, missions)

## Visual Design Patterns

### Color Palette

```css
/* Primary Colors */
--primary-orange: #ff8c42;  /* Primary CTA, highlights */
--accent-green: #00ff88;    /* Success states, tech signals */
--accent-blue: #0088ff;     /* Information, links */
--accent-red: #ff4444;      /* Errors, alerts */

/* Neutral Colors */
--bg-primary: #0a0a0a;      /* Main background */
--bg-secondary: #1a1a1a;    /* Card backgrounds */
--bg-tertiary: #2a2a2a;     /* Hover states */
--border: #333333;           /* Borders */
--text-primary: #ffffff;     /* Primary text */
--text-secondary: #999999;   /* Secondary text */
--text-muted: #666666;       /* Muted text */

/* Semantic Colors */
--threat: #ff4444;           /* Threat indicators */
--active: #00ff88;           /* Active status */
--warning: #ffaa00;          /* Warnings */
```

### Typography Pattern

```css
/* Font Stack */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Typography Scale */
--text-xs: 0.75rem;    /* 12px - Labels, metadata */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Headings */
--text-2xl: 1.5rem;    /* 24px - Section titles */
--text-3xl: 2rem;      /* 32px - Page titles */

/* Monospace Usage */
code, pre, .mono {
  font-family: var(--font-mono);
  font-size: 0.9em;
  letter-spacing: 0.02em;
}

/* Comments Style */
.comment::before {
  content: "// ";
  color: var(--text-muted);
}
```

### Component Patterns

### Card Component (Tactical Style)

```typescript
// components/ui/tactical-card.tsx
interface TacticalCardProps {
  title: string;
  subtitle?: string;
  status?: "active" | "threat" | "warning" | "neutral";
  children: React.ReactNode;
  className?: string;
}

export function TacticalCard({ title, subtitle, status = "neutral", children, className }: TacticalCardProps) {
  const statusColors = {
    active: "border-green-500/30 bg-green-500/5",
    threat: "border-red-500/30 bg-red-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    neutral: "border-zinc-800 bg-zinc-900/50"
  };
  
  return (
    <div className={cn(
      "border rounded-lg p-4",
      statusColors[status],
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono text-sm text-orange-500">{title}</h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
        {status !== "neutral" && (
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === "active" && "bg-green-500 animate-pulse",
            status === "threat" && "bg-red-500",
            status === "warning" && "bg-yellow-500"
          )} />
        )}
      </div>
      {children}
    </div>
  );
}
```

### Status Indicator Pattern

```typescript
// components/ui/status-indicator.tsx
interface StatusIndicatorProps {
  label: string;
  value: string | number;
  status: "online" | "offline" | "warning" | "error";
  format?: "text" | "number" | "percentage";
}

export function StatusIndicator({ label, value, status, format = "text" }: StatusIndicatorProps) {
  const statusStyles = {
    online: "text-green-500 border-green-500/30",
    offline: "text-zinc-500 border-zinc-800",
    warning: "text-yellow-500 border-yellow-500/30",
    error: "text-red-500 border-red-500/30"
  };
  
  return (
    <div className={cn("border rounded p-3", statusStyles[status])}>
      <div className="text-xs text-zinc-500 font-mono mb-1">{label.toUpperCase()}</div>
      <div className="text-lg font-mono">
        {format === "number" && typeof value === "number" ? value.toLocaleString() :
         format === "percentage" && typeof value === "number" ? `${value}%` :
         value}
      </div>
    </div>
  );
}
```

### Terminal/Console Aesthetic

```typescript
// components/ui/terminal.tsx
export function Terminal({ children, prompt = "$" }: { children: React.ReactNode; prompt?: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center gap-2 mb-2 text-zinc-500">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs">TERMINAL</span>
      </div>
      <div className="text-green-400">
        <span className="text-zinc-600">{prompt}</span> {children}
      </div>
    </div>
  );
}
```

## Brand Identity Extraction Pattern

### Firecrawl Brand Extraction

```typescript
// lib/brand-recon/extract-brand.ts
import { getFirecrawlClient } from "@/lib/firecrawl/client";

export interface BrandIdentity {
  colors: {
    primary: string;
    secondary: string[];
    palette: Array<{ hex: string; usage: string }>;
  };
  typography: {
    primary: string;
    secondary?: string;
    sizes: Record<string, string>;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  images: {
    logo?: string;
    favicon?: string;
    screenshot?: string;
  };
  voice: {
    tone: string;
    keywords: string[];
  };
}

export async function extractBrandIdentity(url: string): Promise<BrandIdentity> {
  const firecrawl = getFirecrawlClient();
  
  // Use Firecrawl's brand extraction format
  const result = await firecrawl.scrape(url, {
    formats: ["markdown", "html"],
    actions: [{ type: "screenshot" }],
    onlyMainContent: true
  });
  
  // Extract brand data from HTML/CSS
  const brandData = parseBrandData(result.data);
  
  return {
    colors: extractColors(brandData),
    typography: extractTypography(brandData),
    spacing: extractSpacing(brandData),
    images: {
      logo: extractLogo(brandData),
      screenshot: result.data?.screenshot
    },
    voice: extractVoice(brandData)
  };
}
```

## Content Patterns

### Copywriting Style

```typescript
// lib/brand-recon/voice-patterns.ts
export const DMG_VOICE_PATTERNS = {
  tone: "Technical, confident, slightly provocative",
  keywords: [
    "arsenal", "intel", "protocol", "mission", "recon",
    "threat", "signal", "system", "weapon", "sentience",
    "deploy", "activate", "execute", "overwatch"
  ],
  phrases: [
    "an ideas lab with matches",
    "your data is cold. we bring the matches",
    "stop hiring 'guys.' start installing sentience",
    "the end is near. for some it's already too late"
  ],
  structure: {
    headings: "SHORT, IMPACTFUL, UPPERCASE",
    subheadings: "Descriptive, lowercase, technical",
    body: "Concise, direct, no fluff"
  }
};
```

### Navigation Pattern

```typescript
// components/navigation/dmg-nav.tsx
const NAVIGATION = [
  { name: "ARSENAL", href: "/arsenal", description: "Templates + Blueprints" },
  { name: "INTEL", href: "/intel", description: "Field Reports" },
  { name: "SUITE", href: "/enrich", description: "Live Recon Tools" },
  { name: "PROTOCOLS", href: "/loadout", description: "Audits + Playbooks" }
];

export function DMGNavigation() {
  return (
    <nav className="border-b border-zinc-800">
      <div className="flex items-center gap-8 px-6 py-4">
        {NAVIGATION.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group font-mono text-sm text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <div className="flex flex-col">
              <span>{item.name}</span>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-500">
                {item.description}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

## Integration with Unified Suite

### Current Implementation
- **Location**: `app/`, `components/`, `app/globals.css`
- **Status**: Basic DMG styling applied, cyberpunk aesthetic implemented
- **Enhancements Needed**: Brand extraction API, automated style guide generation

### Suite-Level Enhancements
1. **Brand extraction**: Integrate Firecrawl brand extraction format
2. **Style guide generation**: Auto-generate style guides from extracted brand data
3. **Component library**: Build reusable tactical UI components
4. **Theming system**: Implement dark/light mode with brand colors
5. **Icon system**: Consistent iconography matching DMG aesthetic

## File Structure
```
components/
  ui/
    tactical-card.tsx          # Tactical-style card component
    status-indicator.tsx       # Status display component
    terminal.tsx               # Terminal/console aesthetic
  navigation/
    dmg-nav.tsx                # DMG-style navigation
lib/
  brand-recon/
    extract-brand.ts           # Brand identity extraction
    voice-patterns.ts          # Content voice patterns
app/
  globals.css                  # Global DMG styles
```

## References
- [DMG Marketing Site](https://www.digitalmischiefgroup.com/)
- [Firecrawl Brand Extraction Docs](https://docs.firecrawl.dev/features/scrape#extract-brand-identity)
