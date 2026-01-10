# Firecrawl Brand Style Guide Generator - Cursor Rules

## Overview
This document defines patterns and best practices for building brand style guide generators using Firecrawl's branding format to extract design systems from websites and generate professional PDF documents.

## Core Concept
Extract complete brand identity (colors, typography, spacing, images) from any website using Firecrawl's `branding` format, then generate professional PDF style guides.

## Architecture Pattern

### Core Components
1. **Firecrawl Scraper**: Extracts branding data using `formats: ["branding"]`
2. **PDF Generator**: Creates professional PDF documents using PDFKit
3. **Image Handler**: Downloads and embeds logos/favicons
4. **Data Processor**: Transforms branding data into PDF sections

## Branding Format Structure

### Complete Branding Profile
```typescript
interface BrandingProfile {
  colorScheme: "dark" | "light";
  logo?: string;
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    textPrimary?: string;
    textSecondary?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  typography: {
    fontFamilies: {
      primary?: string;
      heading?: string;
      code?: string;
    };
    fontSizes: {
      h1?: string;
      h2?: string;
      h3?: string;
      body?: string;
      small?: string;
    };
    fontWeights: {
      regular?: number;
      medium?: number;
      bold?: number;
    };
  };
  spacing: {
    baseUnit?: number;
    borderRadius?: string;
  };
  images: {
    logo?: string;
    favicon?: string;
    ogImage?: string;
  };
  components?: {
    buttonPrimary?: {
      background: string;
      textColor: string;
    };
  };
}
```

## Implementation Pattern

### Standard Generator Structure
```typescript
import FirecrawlApp from "@mendable/firecrawl-js";
import PDFDocument from "pdfkit";
import fs from "fs";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

async function generateBrandStyleGuide(url: string, outputPath: string) {
  // 1. Extract branding data
  const { branding } = await app.scrape(url, { 
    formats: ["branding"] 
  }) as { branding: BrandingProfile };
  
  // 2. Create PDF document
  const doc = new PDFDocument({ 
    size: "A4", 
    margin: 50 
  });
  doc.pipe(fs.createWriteStream(outputPath));
  
  // 3. Generate PDF sections
  await generateHeader(doc, branding, url);
  generateColorsSection(doc, branding);
  generateTypographySection(doc, branding);
  generateSpacingSection(doc, branding);
  
  doc.end();
  return outputPath;
}
```

## PDF Generation Patterns

### Header Generation
```typescript
async function generateHeader(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile,
  url: string
) {
  // Fetch logo (PNG/JPG only - PDFKit limitation)
  let logoImg: Buffer | null = null;
  try {
    const logoUrl = branding.images?.favicon || branding.images?.ogImage;
    if (logoUrl?.match(/\.(png|jpg|jpeg)$/i)) {
      const res = await fetch(logoUrl);
      logoImg = Buffer.from(await res.arrayBuffer());
    }
  } catch (error) {
    console.warn("Could not load logo:", error);
  }
  
  // Header background
  const headerColor = branding.colors?.primary || "#333";
  doc.rect(0, 0, 595, 120).fill(headerColor);
  
  // Logo and title
  const titleX = logoImg ? 130 : 50;
  if (logoImg) {
    doc.image(logoImg, 50, 30, { height: 60 });
  }
  
  doc
    .fontSize(36)
    .fillColor("#fff")
    .text("Brand Style Guide", titleX, 38);
  
  doc
    .fontSize(14)
    .text(url, titleX, 80);
}
```

### Colors Section
```typescript
function generateColorsSection(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile
) {
  doc
    .fontSize(18)
    .fillColor("#333")
    .text("Colors", 50, 160);
  
  // Filter valid hex colors
  const colors = Object.entries(branding.colors || {})
    .filter(([, v]) => typeof v === "string" && (v as string).startsWith("#"));
  
  // Render color swatches
  colors.forEach(([name, hex], i) => {
    const x = 50 + (i % 4) * 100;
    const y = 195 + Math.floor(i / 4) * 100;
    
    // Color swatch
    doc.rect(x, y, 80, 80).fill(hex as string);
    
    // Label
    doc
      .fontSize(10)
      .fillColor("#333")
      .text(name, x, y + 85, { width: 80, align: "center" });
    
    // Hex value
    doc
      .fontSize(9)
      .fillColor("#888")
      .text(hex as string, x, y + 99, { width: 80, align: "center" });
  });
}
```

### Typography Section
```typescript
function generateTypographySection(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile
) {
  doc
    .fontSize(18)
    .fillColor("#333")
    .text("Typography", 50, 340);
  
  doc
    .fontSize(13)
    .fillColor("#444");
  
  const typography = branding.typography || {};
  
  // Font families
  doc.text(
    `Primary Font: ${typography.fontFamilies?.primary || "—"}`,
    50, 370
  );
  doc.text(
    `Heading Font: ${typography.fontFamilies?.heading || "—"}`,
    50, 392
  );
  
  // Font sizes
  doc
    .fontSize(12)
    .fillColor("#666")
    .text("Font Sizes:", 50, 422);
  
  Object.entries(typography.fontSizes || {}).forEach(([key, size], i) => {
    doc.text(
      `${key.toUpperCase()}: ${size}`,
      70, 445 + i * 22
    );
  });
}
```

### Spacing Section
```typescript
function generateSpacingSection(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile
) {
  doc
    .fontSize(18)
    .fillColor("#333")
    .text("Spacing & Theme", 320, 340);
  
  doc
    .fontSize(13)
    .fillColor("#444");
  
  const spacing = branding.spacing || {};
  
  doc.text(
    `Base Unit: ${spacing.baseUnit || "—"}px`,
    320, 370
  );
  doc.text(
    `Border Radius: ${spacing.borderRadius || "—"}`,
    320, 392
  );
  doc.text(
    `Color Scheme: ${branding.colorScheme || "—"}`,
    320, 414
  );
}
```

## Advanced Features

### Component Documentation
```typescript
function generateComponentsSection(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile
) {
  if (!branding.components) return;
  
  doc.addPage();
  doc
    .fontSize(20)
    .fillColor("#333")
    .text("UI Components", 50, 50);
  
  // Button styles
  if (branding.components.buttonPrimary) {
    const btn = branding.components.buttonPrimary;
    
    doc
      .fontSize(14)
      .text("Primary Button", 50, 90);
    
    // Button preview
    doc
      .rect(50, 110, 120, 40)
      .fill(btn.background);
    
    doc
      .fontSize(12)
      .fillColor(btn.textColor)
      .text("Button", 50, 120, { width: 120, align: "center" });
  }
}
```

### Multi-Format Export
```typescript
async function exportBrandData(
  branding: BrandingProfile,
  outputDir: string
) {
  // PDF export
  await generatePDF(branding, `${outputDir}/style-guide.pdf`);
  
  // JSON export
  fs.writeFileSync(
    `${outputDir}/brand-data.json`,
    JSON.stringify(branding, null, 2)
  );
  
  // CSS variables export
  const cssVars = generateCSSVariables(branding);
  fs.writeFileSync(
    `${outputDir}/brand-variables.css`,
    cssVars
  );
}
```

### Batch Processing
```typescript
async function batchGenerateStyleGuides(urls: string[]) {
  const results = [];
  
  for (const url of urls) {
    try {
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { branding } = await app.scrape(url, { 
        formats: ["branding"] 
      }) as { branding: BrandingProfile };
      
      const outputPath = `guides/${sanitizeUrl(url)}-style-guide.pdf`;
      await generatePDF(branding, outputPath);
      
      results.push({ url, outputPath, success: true });
    } catch (error) {
      results.push({ url, error: error.message, success: false });
    }
  }
  
  return results;
}
```

### Theme-Aware PDF Generation
```typescript
function generateThemeAwarePDF(
  doc: PDFKit.PDFDocument,
  branding: BrandingProfile
) {
  const isDarkMode = branding.colorScheme === "dark";
  const headerBg = isDarkMode 
    ? branding.colors?.background 
    : branding.colors?.primary;
  const textColor = isDarkMode ? "#fff" : "#333";
  const bgColor = isDarkMode ? "#1a1a1a" : "#ffffff";
  
  // Apply theme colors throughout document
  doc.rect(0, 0, 595, 120).fill(headerBg || "#333");
  doc.fillColor(textColor);
  // ... rest of generation
}
```

## Best Practices

### Error Handling
1. **Handle missing data**: Always provide fallback values
   ```typescript
   const primaryColor = branding.colors?.primary || "#333";
   ```
2. **Image format handling**: PDFKit only supports PNG/JPG
   ```typescript
   if (logoUrl?.match(/\.(png|jpg|jpeg)$/i)) {
     // Process image
   }
   ```
3. **Wrap in try-catch**: Handle API and generation errors
   ```typescript
   try {
     await generateStyleGuide(url);
   } catch (error) {
     console.error("Generation failed:", error);
     // Provide user-friendly error message
   }
   ```

### Performance Optimization
1. **Cache branding data**: Store extracted data to avoid re-scraping
   ```typescript
   const cacheKey = `branding-${url}`;
   let branding = cache.get(cacheKey);
   if (!branding) {
     branding = await app.scrape(url, { formats: ["branding"] });
     cache.set(cacheKey, branding, 3600); // 1 hour TTL
   }
   ```
2. **Respect rate limits**: Add delays between batch requests
3. **Stream PDF generation**: Use `doc.pipe()` for large documents

### Data Validation
1. **Validate color formats**: Ensure hex colors are valid
2. **Check required fields**: Verify essential branding data exists
3. **Sanitize URLs**: Clean URLs for file naming

### PDF Quality
1. **Consistent margins**: Use 50px margins for readability
2. **Clear hierarchy**: Use font sizes 18, 14, 12, 10 for sections
3. **Color contrast**: Ensure text is readable on backgrounds
4. **Professional layout**: Organize sections logically

## File Structure
```
lib/
  brand-guide/
    generator.ts       # Main generator function
    pdf-sections.ts    # PDF section generators
    branding-types.ts  # TypeScript interfaces
app/
  api/
    brand-guide/
      route.ts         # API route for generation
scripts/
  generate-guide.ts   # CLI script for generation
```

## Dependencies
```json
{
  "@mendable/firecrawl-js": "latest",
  "pdfkit": "latest",
  "@types/pdfkit": "latest"
}
```

## Environment Variables
```bash
FIRECRAWL_API_KEY=fc-your-firecrawl-api-key
```

## Use Cases

### Single Site Analysis
```typescript
await generateBrandStyleGuide(
  "https://stripe.com",
  "stripe-style-guide.pdf"
);
```

### Competitive Analysis
```typescript
const competitors = [
  "https://stripe.com",
  "https://linear.app",
  "https://vercel.com"
];

for (const site of competitors) {
  await generateBrandStyleGuide(site, `${site}-guide.pdf`);
}
```

### Design System Documentation
```typescript
// Extract and document your own design system
await generateBrandStyleGuide(
  "https://your-company.com",
  "internal-style-guide.pdf"
);
```

## References
- [Branding Format Documentation](https://docs.firecrawl.dev/features/scrape#extract-brand-identity)
- [Firecrawl Scrape API](https://docs.firecrawl.dev/api-reference/endpoint/scrape)
- [PDFKit Documentation](http://pdfkit.org/)
- [Original Cookbook](https://docs.firecrawl.dev/developer-guides/cookbooks/brand-style-guide-generator-cookbook)
