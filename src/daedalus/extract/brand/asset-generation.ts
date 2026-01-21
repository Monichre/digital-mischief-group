/**
 * Brand Asset Generation Workflow
 *
 * Uses extracted brand identity (colors, fonts, voice) to generate
 * brand-consistent marketing assets: email templates, landing pages, and social posts.
 *
 * Part of T-010 - Brand Asset Generation
 */

import { z } from 'zod'
import { generateObject } from '@/platform/llm-service'
import { DEFAULT_TEXT_MODEL } from '@/ai/models'

// Asset type schema definitions
export const EmailTemplateSchema = z.object({
  subject: z.string().describe('Email subject line'),
  preheader: z.string().describe('Preview text shown in inbox'),
  headline: z.string().describe('Main headline'),
  body: z.string().describe('Main email body content in markdown'),
  cta_text: z.string().describe('Call-to-action button text'),
  cta_url_placeholder: z.string().describe('Placeholder for CTA URL'),
  footer: z.string().describe('Footer text'),
  html: z.string().describe('Full HTML email template with inline styles'),
})

export const LandingPageSchema = z.object({
  headline: z.string().describe('Main hero headline'),
  subheadline: z.string().describe('Supporting subheadline'),
  value_props: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).describe('Key value propositions'),
  cta_primary: z.object({
    text: z.string(),
    url_placeholder: z.string(),
  }),
  cta_secondary: z.object({
    text: z.string(),
    url_placeholder: z.string(),
  }).optional(),
  testimonial_placeholder: z.object({
    quote: z.string(),
    author: z.string(),
    role: z.string(),
  }).optional(),
  html: z.string().describe('Full HTML landing page section with inline styles'),
  markdown: z.string().describe('Markdown version of the landing page content'),
})

export const SocialPostsSchema = z.object({
  twitter: z.array(
    z.object({
      content: z.string().max(280).describe('Twitter/X post content'),
      hashtags: z.array(z.string()),
      type: z.enum(['announcement', 'engagement', 'educational', 'promotional']),
    })
  ).min(3).describe('Twitter/X posts (max 280 chars each)'),
  linkedin: z.array(
    z.object({
      content: z.string().describe('LinkedIn post content'),
      hashtags: z.array(z.string()),
      type: z.enum(['thought_leadership', 'company_update', 'industry_insight', 'promotional']),
    })
  ).min(2).describe('LinkedIn posts'),
  instagram: z.array(
    z.object({
      caption: z.string().describe('Instagram caption'),
      hashtags: z.array(z.string()),
      image_prompt: z.string().describe('Prompt to generate accompanying image'),
      type: z.enum(['brand_story', 'product_showcase', 'behind_the_scenes', 'educational']),
    })
  ).min(2).describe('Instagram posts'),
})

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>
export type LandingPage = z.infer<typeof LandingPageSchema>
export type SocialPosts = z.infer<typeof SocialPostsSchema>

export interface BrandContext {
  companyName: string
  description?: string
  colors: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    textPrimary?: string
  }
  typography?: {
    fontFamilies?: {
      primary?: string
      heading?: string
    }
  }
  personality?: {
    tone?: string[]
    targetAudience?: string
  }
  logo?: string
  website?: string
}

export interface AssetGenerationInput {
  brandContext: BrandContext
  assetTypes: ('email' | 'landing' | 'social')[]
  customInstructions?: string
}

export interface AssetGenerationOutput {
  email?: EmailTemplate
  landing?: LandingPage
  social?: SocialPosts
  generatedAt: string
  brandSummary: {
    primaryColor: string
    fontFamily: string
    tone: string
  }
}

function buildBrandStyleBlock(brand: BrandContext): string {
  const primaryColor = brand.colors.primary || '#FF6B00'
  const secondaryColor = brand.colors.secondary || '#1A1A1A'
  const accentColor = brand.colors.accent || primaryColor
  const bgColor = brand.colors.background || '#FFFFFF'
  const textColor = brand.colors.textPrimary || '#1A1A1A'
  const fontFamily = brand.typography?.fontFamilies?.primary || 'Inter, system-ui, sans-serif'
  const headingFont = brand.typography?.fontFamilies?.heading || fontFamily
  const tone = brand.personality?.tone?.join(', ') || 'professional'
  const audience = brand.personality?.targetAudience || 'business professionals'

  return `
Brand Identity:
- Company: ${brand.companyName}
- Description: ${brand.description || 'Not provided'}
- Website: ${brand.website || 'Not provided'}

Visual Style:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Accent Color: ${accentColor}
- Background: ${bgColor}
- Text Color: ${textColor}
- Primary Font: ${fontFamily}
- Heading Font: ${headingFont}

Voice & Tone:
- Tone: ${tone}
- Target Audience: ${audience}

Logo URL: ${brand.logo || 'Not provided'}
`
}

const EMAIL_SYSTEM_PROMPT = `You are an expert email marketing copywriter and designer. Generate brand-consistent email templates that:
- Match the brand's visual identity (colors, fonts)
- Use the brand's tone of voice
- Are optimized for conversions
- Include proper HTML with inline styles for email client compatibility
- Are mobile-responsive

The HTML should use inline styles only (no <style> blocks) and be compatible with major email clients.`

const LANDING_SYSTEM_PROMPT = `You are an expert landing page copywriter and designer. Generate brand-consistent landing page content that:
- Matches the brand's visual identity (colors, fonts)
- Uses the brand's tone of voice
- Follows proven conversion patterns (AIDA, PAS)
- Includes compelling value propositions
- Has clear calls-to-action

Generate both HTML (with inline styles) and markdown versions.`

const SOCIAL_SYSTEM_PROMPT = `You are an expert social media strategist and copywriter. Generate brand-consistent social media content that:
- Matches the brand's tone of voice
- Is optimized for each platform's best practices
- Includes relevant hashtags
- Encourages engagement
- Maintains brand consistency across platforms

For Twitter, keep posts under 280 characters. For Instagram, include image prompts that could be used with AI image generators.`

export async function generateEmailTemplate(
  brand: BrandContext,
  customInstructions?: string
): Promise<EmailTemplate> {
  const brandBlock = buildBrandStyleBlock(brand)

  const prompt = `Generate a professional email template for ${brand.companyName}.

${brandBlock}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Create an engaging welcome/promotional email that:
1. Has an attention-grabbing subject line
2. Uses the brand colors in the design
3. Maintains the brand's tone of voice
4. Has a clear call-to-action
5. Includes proper HTML structure with inline styles

Use the primary color (${brand.colors.primary || '#FF6B00'}) for buttons and accents.
Use the text color for body text.
Keep the design clean and professional.`

  const result = await generateObject({
    schema: EmailTemplateSchema,
    prompt,
    systemPrompt: EMAIL_SYSTEM_PROMPT,
    model: DEFAULT_TEXT_MODEL,
    temperature: 0.7,
  })

  return result.data
}

export async function generateLandingPage(
  brand: BrandContext,
  customInstructions?: string
): Promise<LandingPage> {
  const brandBlock = buildBrandStyleBlock(brand)

  const prompt = `Generate landing page content for ${brand.companyName}.

${brandBlock}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Create compelling landing page content that:
1. Has a powerful headline and subheadline
2. Presents 3-4 key value propositions
3. Uses the brand colors in the design
4. Maintains the brand's tone of voice
5. Has clear primary and secondary CTAs
6. Includes a sample testimonial placeholder

The HTML should:
- Use inline styles with the brand colors
- Be clean and modern
- Include proper semantic HTML
- Use the primary color (${brand.colors.primary || '#FF6B00'}) for CTAs and accents`

  const result = await generateObject({
    schema: LandingPageSchema,
    prompt,
    systemPrompt: LANDING_SYSTEM_PROMPT,
    model: DEFAULT_TEXT_MODEL,
    temperature: 0.7,
  })

  return result.data
}

export async function generateSocialPosts(
  brand: BrandContext,
  customInstructions?: string
): Promise<SocialPosts> {
  const brandBlock = buildBrandStyleBlock(brand)

  const prompt = `Generate social media content for ${brand.companyName}.

${brandBlock}

${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Create engaging social media content that:
1. Maintains the brand's tone of voice
2. Is optimized for each platform
3. Includes relevant hashtags
4. Encourages engagement and sharing

Generate:
- At least 3 Twitter/X posts (MUST be under 280 characters each)
- At least 2 LinkedIn posts (thought leadership style)
- At least 2 Instagram posts with captions and image prompts

Make the content feel authentic to the brand's personality.`

  const result = await generateObject({
    schema: SocialPostsSchema,
    prompt,
    systemPrompt: SOCIAL_SYSTEM_PROMPT,
    model: DEFAULT_TEXT_MODEL,
    temperature: 0.8,
  })

  return result.data
}

export async function generateBrandAssets(
  input: AssetGenerationInput
): Promise<AssetGenerationOutput> {
  const { brandContext, assetTypes, customInstructions } = input

  const output: AssetGenerationOutput = {
    generatedAt: new Date().toISOString(),
    brandSummary: {
      primaryColor: brandContext.colors.primary || '#FF6B00',
      fontFamily: brandContext.typography?.fontFamilies?.primary || 'Inter',
      tone: brandContext.personality?.tone?.[0] || 'professional',
    },
  }

  // Generate assets in parallel where possible
  const promises: Promise<void>[] = []

  if (assetTypes.includes('email')) {
    promises.push(
      generateEmailTemplate(brandContext, customInstructions).then((email) => {
        output.email = email
      })
    )
  }

  if (assetTypes.includes('landing')) {
    promises.push(
      generateLandingPage(brandContext, customInstructions).then((landing) => {
        output.landing = landing
      })
    )
  }

  if (assetTypes.includes('social')) {
    promises.push(
      generateSocialPosts(brandContext, customInstructions).then((social) => {
        output.social = social
      })
    )
  }

  await Promise.all(promises)

  return output
}
