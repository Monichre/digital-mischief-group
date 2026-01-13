"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function testOpenAIConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        message: "OpenAI API key is not configured",
      }
    }

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "user",
          content: "Say 'Hello, OpenAI connection is working!'",
        },
      ],
      maxTokens: 50,
    })

    return {
      success: true,
      message: `Connection successful: ${result.text}`,
    }
  } catch (error: any) {
    console.error("OpenAI connection test failed:", error)
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
    }
  }
}
