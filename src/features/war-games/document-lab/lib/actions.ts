"use server"

import { generateText } from "ai"
import { headers } from "next/headers"
import { checkRateLimit } from "./rate-limit"
import { MODELS } from "@/ai/models"


interface AnalyzePdfParams {
  pdfBuffer: ArrayBuffer
  question: string
}

export async function analyzePdf( { pdfBuffer, question }: AnalyzePdfParams ): Promise<string | { error: Error }> {
  try {
    // Get client IP for rate limiting
    const headersList = await headers()
    const ip = headersList.get( "x-forwarded-for" ) ?? headersList.get( "x-real-ip" ) ?? "127.0.0.1"
    const identifier = `ai-pdf-ingest-${ip}`

    // Check rate limit
    const { success } = await checkRateLimit( identifier )
    if ( !success ) {
      return {
        error: new Error( "Rate limit exceeded. Please try again tomorrow." ),
      }
    }

    // Validate inputs
    if ( !pdfBuffer || pdfBuffer.byteLength === 0 ) {
      return {
        error: new Error( "Invalid PDF file" ),
      }
    }

    if ( !question.trim() ) {
      return {
        error: new Error( "Question cannot be empty" ),
      }
    }

    // Check file size (1MB limit)
    if ( pdfBuffer.byteLength > 1 * 1024 * 1024 ) {
      return {
        error: new Error( "PDF file size exceeds 1MB limit" ),
      }
    }

    // Verify API key is available
    if ( !process.env.OPENAI_API_KEY ) {
      return {
        error: new Error( "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables." ),
      }
    }

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from( pdfBuffer )

    console.log( "Attempting to analyze PDF with OpenAI..." )
    console.log( "Buffer size:", buffer.length )
    console.log( "Question:", question )

    try {
      const result = await generateText( {
        model: MODELS.openai.gpt52,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this PDF document and answer the following question: ${question}`,
              },
              {
                type: "file",
                data: buffer,
                mediaType: "application/pdf",
                filename: "document.pdf",
              },
            ],
          },
        ],
        maxOutputTokens: 1000,
      } )

      console.log( "OpenAI response received successfully" )
      return result.text
    } catch ( aiError: any ) {
      console.error( "AI SDK Error Details:", {
        message: aiError.message,
        name: aiError.name,
        stack: aiError.stack,
        cause: aiError.cause,
      } )

      // Handle specific AI SDK errors
      if ( aiError.message?.includes( "API key" ) ) {
        return {
          error: new Error( "Invalid OpenAI API key. Please check your API key configuration." ),
        }
      }

      if ( aiError.message?.includes( "rate limit" ) || aiError.message?.includes( "quota" ) ) {
        return {
          error: new Error( "OpenAI rate limit exceeded. Please try again later." ),
        }
      }

      if ( aiError.message?.includes( "model" ) ) {
        return {
          error: new Error( "Model not available. Please try again later." ),
        }
      }

      if ( aiError.message?.includes( "file" ) || aiError.message?.includes( "PDF" ) ) {
        return {
          error: new Error( "Error processing PDF file. Please ensure it's a valid PDF." ),
        }
      }

      // If we get HTML response, it's likely an authentication issue
      if ( aiError.message?.includes( "DOCTYPE" ) || aiError.message?.includes( "HTML" ) ) {
        return {
          error: new Error( "Authentication error with OpenAI API. Please check your API key." ),
        }
      }

      return {
        error: new Error( `OpenAI API error: ${aiError.message || "Unknown error occurred"}` ),
      }
    }
  } catch ( error: any ) {
    console.error( "General error in analyzePdf:", error )
    return {
      error: new Error( `Failed to analyze PDF: ${error.message || "Unknown error"}` ),
    }
  }
}
