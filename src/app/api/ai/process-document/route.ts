import { generateObject } from "ai"
import { z } from "zod"
import { MODELS } from "@/ai/models"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

export const maxDuration = 60

const documentExtractionSchema = z.object( {
  title: z.string().optional().describe( "Document title or main heading" ),
  summary: z.string().describe( "Brief summary of the document content" ),
  entities: z.array( z.string() ).optional().describe( "Named entities found (people, companies, places)" ),
  keywords: z.array( z.string() ).optional().describe( "Key topics and keywords" ),
  sentiment: z.enum( ["positive", "negative", "neutral", "mixed"] ).optional().describe( "Overall document sentiment" ),
  language: z.string().optional().describe( "Document language" ),
  pageCount: z.number().optional().describe( "Estimated page count if applicable" ),
  wordCount: z.number().optional().describe( "Approximate word count" ),
} )

export async function POST( req: Request ) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Validate input
  const { file } = await req.json()
  if (!file || !file.data || !file.mediaType) {
    return Response.json({ error: "File with data and mediaType is required" }, { status: 400 })
  }

  try {
    const { object } = await generateObject( {
      model: MODELS.anthropic.sonnet45,
      schema: documentExtractionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this document and extract the following information:
- Title or main heading
- A concise summary (2-3 sentences)
- Named entities (people, companies, places, organizations)
- Key topics and keywords
- Overall sentiment
- Language
- Approximate word/page count

Be thorough and accurate.`,
            },
            {
              type: "file",
              data: file.data,
              mediaType: file.mediaType || "application/pdf",
              filename: file.filename || "document.pdf",
            },
          ],
        },
      ],
    } )

    return Response.json( { extractedData: object } )
  } catch ( error ) {
    console.error( "Document processing error:", error )
    return Response.json( { error: "Failed to process document" }, { status: 500 } )
  }
}
