// Convert this block to a simple few shot prompt editor + evaluator
'use server'

import {streamObject} from 'ai'
import {z} from 'zod'

import {evaluationResultSchema, type promptFormSchema} from './schema'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function evaluatePrompt(data: z.infer<typeof promptFormSchema>) {
  if (data.evaluation && data.output) {
    const {partialObjectStream} = streamObject({
      model: 'openai/gpt-4.1-mini',
      schema: evaluationResultSchema,
      system: `You are an expert AI prompt evaluator. You must respond in JSON format. Analyze both the prompt configuration and the generated output for:
1. Consistency: How well does the output match the format and style shown in the examples? (0-100)
2. Relevance: How well does the output address the input query and follow the system prompt? (0-100)
3. Quality: How well-structured, accurate, and useful is the output? (0-100)

Provide specific feedback on:
- Format consistency with examples
- Adherence to system prompt
- Completeness and accuracy
- Areas for improvement
`,
      messages: [
        {
          role: 'user',
          content: `Evaluate this prompt configuration and its output:

SYSTEM PROMPT:
${data.systemPrompt}

EXAMPLES:
${data.examples
  .map(
    (ex, i) => `
Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}`
  )
  .join('\n')}

TEST INPUT:
${data.testInput}

GENERATED OUTPUT:
${data.output}

Analyze the consistency, relevance, and quality. Provide specific feedback on what works well and what could be improved.`,
        },
      ],
    })

    let result = {}
    for await (const chunk of partialObjectStream) {
      result = chunk
    }
    return {output: result}
  }

  // Regular prompt execution
  const messages: Message[] = [
    {
      role: 'system',
      content: data.systemPrompt,
    },
    ...data.examples.flatMap((example): Message[] => [
      {role: 'user', content: example.input},
      {role: 'assistant', content: example.output},
    ]),
    {role: 'user', content: data.testInput},
  ]

  const {partialObjectStream} = streamObject({
    model: 'openai/gpt-4.1-mini',
    output: 'no-schema',
    messages,
  })

  let result = {}
  for await (const partialObject of partialObjectStream) {
    result = partialObject
  }
  return {output: result}
}

export async function improveExamples(data: z.infer<typeof promptFormSchema>) {
  try {
    const {partialObjectStream} = streamObject({
      model: 'openai/gpt-4.1-mini',
      output: 'object',
      schema: z.object({
        examples: z.array(
          z.object({
            input: z.string(),
            output: z.string(),
            explanation: z.string(),
          })
        ),
        reasoningText: z.string(),
      }),
      system: `You are an expert at designing few-shot prompts. Analyze the current prompt configuration and generate improved examples that will help the model better understand the task.
    
    IMPORTANT: You must return a SINGLE valid JSON object with the exact structure specified in the schema.
    
    Consider:
    1. The system prompt's requirements
    2. The format and structure needed
    3. The current examples' strengths and weaknesses
    4. The evaluation results and feedback
    5. Edge cases that should be covered
    
    Generate 2-4 improved examples that:
    - Better demonstrate the expected format
    - Cover important edge cases
    - Show a range of complexity
    - Are clear and unambiguous
    
    For each example, include a brief explanation of why it was chosen and what it demonstrates.
    
    CRITICAL: The "output" field in each example must be a STRING (not a JSON object). If the output should be JSON, format it as a JSON string with proper escaping.
    
    Return format must be a single JSON object with:
    - "examples": array of objects with "input", "output" (as string), and "explanation" fields
    - "reasoningText": string explaining your overall approach
    
    Example of correct output format:
    {
      "examples": [
        {
          "input": "Contact John at john@email.com",
          "output": "{\\"name\\": \\"John\\", \\"email\\": \\"john@email.com\\"}",
          "explanation": "This example shows..."
        }
      ],
      "reasoningText": "Overall reasoning..."
    }
    
    Do NOT return multiple JSON objects or concatenated JSON. Return exactly ONE valid JSON object.`,
      messages: [
        {
          role: 'user',
          content: `Current prompt configuration.
    
    SYSTEM PROMPT:
    ${data.systemPrompt}
    
    CURRENT EXAMPLES:
    ${data.examples
      .map(
        (ex, i) => `
    Example ${i + 1}:
    Input: ${ex.input}
    Output: ${ex.output}`
      )
      .join('\n')}
    
    RECENT TEST:
    Input: ${data.testInput}
    Output: ${data.output}
    
    Generate improved examples that will make this prompt more robust and effective. For each example, explain its purpose and what it demonstrates.`,
        },
      ],
    })

    let result = {}
    for await (const partialObject of partialObjectStream) {
      result = partialObject
    }
    return {output: result}
  } catch (error) {
    console.error('Error generating improved examples:', error)
    throw new Error('Failed to generate improved examples. Please try again.')
  }
}
