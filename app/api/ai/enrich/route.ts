import { streamObject } from "ai"
import { z } from "zod"

export const maxDuration = 60

const companyEnrichmentSchema = z.object({
  company: z.object({
    name: z.string().describe("Company name"),
    description: z.string().describe("Brief company description"),
    industry: z.string().describe("Primary industry"),
    subIndustry: z.string().optional().describe("Sub-industry or niche"),
    founded: z.string().optional().describe("Year founded"),
    headquarters: z.string().optional().describe("Headquarters location"),
    employeeRange: z.string().optional().describe("Employee count range"),
    revenue: z.string().optional().describe("Revenue estimate"),
    fundingStage: z.string().optional().describe("Funding stage if applicable"),
  }),
  leadership: z
    .array(
      z.object({
        name: z.string(),
        title: z.string(),
        linkedin: z.string().optional(),
      }),
    )
    .optional()
    .describe("Key leadership team members"),
  technologies: z.array(z.string()).optional().describe("Technologies used"),
  competitors: z.array(z.string()).optional().describe("Main competitors"),
  marketPosition: z
    .object({
      strengths: z.array(z.string()),
      opportunities: z.array(z.string()),
    })
    .optional()
    .describe("Market positioning analysis"),
  socialPresence: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  enrichmentScore: z.number().min(0).max(100).describe("Data completeness score 0-100"),
})

export async function POST(req: Request) {
  const { input, inputType } = await req.json()

  const prompt = `You are a company intelligence analyst. Given the following ${inputType} input, research and provide comprehensive company information.

Input: ${input}
Input Type: ${inputType}

Analyze this input and provide detailed company intelligence. If it's an email, extract the domain and research the company. If it's a URL, analyze the company website. If it's a company name, provide what you know.

Be thorough but accurate. If you don't have information for a field, omit it rather than guessing. Estimate the enrichmentScore based on how complete and confident your data is.`

  const result = streamObject({
    model: "openai/gpt-4o-mini",
    prompt,
    schema: companyEnrichmentSchema,
  })

  return result.toTextStreamResponse()
}
