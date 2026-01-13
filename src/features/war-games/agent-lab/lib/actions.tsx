/**
 * AI Agent Actions Module
 *
 * This module implements various AI agent patterns for different use cases:
 * - Multi-step Tool Usage: Agents that can use tools iteratively
 * - Sequential Processing: Step-by-step execution of tasks
 * - Routing: Content-based query routing
 * - Parallel Processing: Concurrent task execution
 * - Orchestrator-Worker: Coordinated task distribution
 * - Evaluator-Optimizer: Iterative content improvement
 */
'use server'

import {openai} from '@ai-sdk/openai'
import {generateObject, generateText, tool} from 'ai'
import * as mathjs from 'mathjs'
import {headers} from 'next/headers'
import {z} from 'zod'
import {checkRateLimit} from './rate-limit'

/**
 * Main entry point for testing different AI agent types
 *
 * This function:
 * 1. Implements rate limiting for API protection
 * 2. Handles input parsing and validation
 * 3. Routes requests to specialized agent implementations
 * 4. Manages error handling and response formatting
 *
 * @param agentType - Type of agent to use (e.g., "multi-step-tool-usage", "routing")
 * @param input - User input as string or key-value pairs
 * @param params - Model configuration parameters
 * @returns JSON string containing agent response and metadata
 */
export async function testAgent(
  agentType: string,
  input: string | Record<string, string>
) {
  // Rate limiting implementation using IP-based tracking
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
  const identifier = `ai-agents-sandbox-${ip}`
  const {success} = await checkRateLimit(identifier)

  if (!success) {
    return {
      error: new Error('Rate limit exceeded. Please try again tomorrow.'),
    }
  }

  // Input normalization
  const inputObject: Record<string, string> =
    typeof input === 'string' ? JSON.parse(input) : input

  // Route to specialized agent implementations
  switch (agentType) {
    case 'multi-step-tool-usage':
      return multiStepToolUsage(inputObject.prompt)

    case 'sequential-processing':
      return sequentialProcessing(inputObject.content, inputObject.instructions)

    case 'routing':
      return routingAgent(inputObject.query)

    case 'orchestrator-worker':
      return orchestratorWorker(
        inputObject.requirements,
        inputObject.constraints
      )

    case 'evaluator-optimizer':
      return evaluatorOptimizer(inputObject.content, inputObject.criteria)

    case 'parallel-processing':
      return parallelProcessing(inputObject.content, inputObject.aspects)

    default:
      throw new Error(`Unknown agent type: ${agentType}`)
  }
}

/**
 * Multi-step Tool Usage Agent
 *
 * Implements an agent that can:
 * - Use multiple tools iteratively
 * - Break down complex problems into steps
 * - Track and format tool usage and results
 * - Provide detailed explanations of the process
 *
 * Tools available:
 * 1. Calculator: For mathematical operations
 * 2. Trip Planner: For travel itinerary generation
 *
 * @param input - User prompt
 * @returns Structured output with steps and results
 */
async function multiStepToolUsage(input: string) {
  const {
    text: answer,
    toolCalls,
    usage,
    steps,
  } = await generateText({
    // model: openai("gpt-5-nano", { structuredOutputs: true }),
    model: openai('gpt-4.1-mini'),

    tools: {
      // Mathematical expression evaluator
      calculate: {
        description:
          'A tool for evaluating mathematical expressions. ' +
          'Example expressions: ' +
          "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
        inputSchema: z.object({
          expression: z.string(),
        }),
        execute: async ({expression}) => {
          try {
            // Sanitize the input expression
            const sanitizedExpression = expression.trim()

            // Validate the expression before evaluation
            if (!sanitizedExpression) {
              throw new Error('Expression cannot be empty')
            }

            // Evaluate the expression safely
            const result = mathjs.evaluate(sanitizedExpression)

            // Format the result
            if (typeof result === 'number') {
              return Number(result.toFixed(6))
            }
            return result
          } catch (error) {
            // Return a user-friendly error message
            if (error instanceof Error) {
              throw new Error(
                `Invalid mathematical expression: ${error.message}`
              )
            }
            throw new Error('Failed to evaluate mathematical expression')
          }
        },
      },
      // Travel planning assistant
      planTrip: {
        description:
          'A tool for planning trip activities and itineraries. ' +
          'Provides suggestions for destinations, activities, and timing.',
        inputSchema: z.object({
          destination: z.string(),
          duration: z.string(),
          preferences: z.string(),
        }),
        execute: async ({
          destination,
          duration,
          preferences: _preferences = '',
        }) => {
          return {
            destination,
            duration,
            suggestedActivities: [
              'Visit popular attractions',
              'Try local cuisine',
              'Experience cultural events',
              'Explore nature spots',
              'Shop at local markets',
            ].map((activity) => ({
              activity,
              timing: 'Flexible',
              notes: `Great option for experiencing ${destination}`,
            })),
            tips: [
              `Best time to visit ${destination}`,
              'Local transportation options',
              'Cultural customs to know',
              'Weather considerations',
            ],
          }
        },
      },
    },
    system:
      'You are solving problems step by step. ' +
      'Use the calculator for mathematical calculations and the trip planner for travel itineraries. ' +
      'When you give the final answer, provide a detailed explanation of your process.',
    prompt: input,
  })

  // Transform raw steps into a structured format for UI rendering
  const formattedSteps = steps.map((step: any, index: number) => {
    const toolCall = step.toolCalls?.[0]
    return {
      step: index + 1,
      text: step.text || step.content || '',
      tool: toolCall?.name || 'thinking',
      input: toolCall?.input,
      result: toolCall?.output,
    }
  })

  return JSON.stringify(
    {
      answer,
      steps: formattedSteps,
      usage,
    },
    null,
    2
  )
}

/**
 * Sequential Processing Agent
 *
 * Implements a step-by-step processing pipeline where:
 * 1. Each step's output becomes input for the next step
 * 2. Steps are executed in a predefined order
 * 3. Progress and results are tracked for each step
 *
 * Steps:
 * 1. Analysis: Deep examination of content
 * 2. Summarization: Distillation of key points
 * 3. Conclusion: Application of specific instructions
 *
 
 * @param content - Content to process
 * @param instructions - Processing instructions
 * @returns Step results and final output
 */
async function sequentialProcessing(content: string, instructions: string) {
  // Define processing pipeline steps
  const steps = [
    {
      name: 'Analyze',
      description: `Analyze the following content:\n${content}`,
    },
    {name: 'Summarize', description: 'Summarize the analysis'},
    {
      name: 'Conclude',
      description: `Apply the instructions: ${instructions}`,
    },
  ]

  let result = content
  const stepResults: {step: string; output: string}[] = []
  const totalUsage = {inputTokens: 0, outputTokens: 0, totalTokens: 0}

  // Execute each step sequentially
  for (const step of steps) {
    const {text, usage} = await generateText({
      model: openai('gpt-4.1-mini'),

      system: `You are performing the "${step.name}" step. ${step.description}`,
      prompt: result,
    })
    result = text
    stepResults.push({step: step.name, output: text})

    // Track token usage across steps
    if (usage) {
      totalUsage.inputTokens += usage.inputTokens || 0
      totalUsage.outputTokens += usage.outputTokens || 0
      totalUsage.totalTokens += usage.totalTokens || 0
    }
  }

  return JSON.stringify(
    {steps: stepResults, finalOutput: result, usage: totalUsage},
    null,
    2
  )
}

/**
 * Routing Agent
 *
 * Implements intelligent query routing based on content analysis:
 * 1. Classifies input query type
 * 2. Routes to appropriate handler
 * 3. Generates specialized responses
 *
 * Query Types:
 * - General: Common knowledge queries
 * - Technical: Technical explanations
 * - Creative: Creative writing tasks
 *
 * @param input - User query
 * @returns Classification and specialized response
 */
async function routingAgent(input: string) {
  // Classify query type
  const {object: classification, usage: classificationUsage} =
    (await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: z.object({
        type: z.enum(['general', 'technical', 'creative']),
        reasoningText: z.string(),
      }),
      prompt: `Classify this query: ${input}\n\nProvide the type (general, technical, or creative) and a brief reasoning.`,
    })) as {
      object: {
        type: 'general' | 'technical' | 'creative'
        reasoningText: string
      }
      usage: any
    }

  // Define specialized prompts for each query type
  const routePrompt = {
    general:
      'You are a general knowledge expert. Provide a comprehensive answer.',
    technical:
      'You are a technical expert. Provide a detailed technical explanation.',
    creative:
      'You are a creative writer. Provide an imaginative and engaging response.',
  }[classification.type]

  // Generate specialized response
  const {text: response, usage: responseUsage} = await generateText({
    model: openai('gpt-4.1-mini'),

    system: routePrompt,
    prompt: input,
  })

  // Aggregate token usage
  const totalUsage = {
    inputTokens:
      (classificationUsage?.inputTokens || 0) +
      (responseUsage?.inputTokens || 0),
    outputTokens:
      (classificationUsage?.outputTokens || 0) +
      (responseUsage?.outputTokens || 0),
    totalTokens:
      (classificationUsage?.totalTokens || 0) +
      (responseUsage?.totalTokens || 0),
  }

  return JSON.stringify({classification, response, usage: totalUsage}, null, 2)
}

/**
 * Parallel Processing Agent
 *
 * Implements concurrent content analysis from multiple perspectives:
 * - Runs multiple analysis tasks simultaneously
 * - Each task focuses on a different aspect
 * - Results are aggregated with metadata
 *
 * Default Aspects:
 * - Summary: Key points and overview
 * - Analysis: Detailed examination
 * - Critique: Critical evaluation
 *

 * @param content - Content to analyze
 * @param aspects - Comma-separated list of analysis aspects
 * @returns Combined analysis results and metadata
 */
async function parallelProcessing(content: string, aspects = '') {
  // Parse aspects or use defaults
  const aspectList = aspects
    ? aspects.split(',').map((a) => a.trim())
    : ['summary', 'analysis', 'critique']
  const totalUsage = {inputTokens: 0, outputTokens: 0, totalTokens: 0}

  // Configure tasks with visual metadata
  const tasks = aspectList.map((aspect) => ({
    name: aspect.charAt(0).toUpperCase() + aspect.slice(1),
    prompt: `Analyze the following content from the perspective of ${aspect}:`,
    icon: aspect.includes('summary')
      ? 'list'
      : aspect.includes('analysis')
      ? 'search'
      : 'sparkles',
    color: aspect.includes('summary')
      ? 'blue'
      : aspect.includes('analysis')
      ? 'green'
      : 'purple',
  }))

  // Execute all analysis tasks concurrently
  const results = await Promise.all(
    tasks.map(async (task) => {
      const {text, usage} = await generateText({
        model: openai('gpt-4.1-mini'),
        system: `You are performing the "${task.name}" task. Focus on providing clear, concise, and insightful analysis from this perspective.`,
        prompt: `${task.prompt}\n\n${content}`,
      })

      if (usage) {
        totalUsage.inputTokens += usage.inputTokens || 0
        totalUsage.outputTokens += usage.outputTokens || 0
        totalUsage.totalTokens += usage.totalTokens || 0
      }

      return {
        task: task.name,
        result: text,
        icon: task.icon,
        color: task.color,
      }
    })
  )

  return JSON.stringify(
    {
      results,
      metadata: {
        inputLength: content.length,
        processedAt: new Date().toISOString(),
        workers: tasks.length,
        aspects: aspectList,
      },
      usage: totalUsage,
    },
    null,
    2
  )
}

/**
 * Orchestrator-Worker Agent
 *
 * Implements a coordinated task distribution system:
 * 1. Orchestrator creates execution plan
 * 2. Workers execute specialized tasks
 * 3. Results are aggregated and returned
 *
 * Features:
 * - Dynamic task planning
 * - Specialized worker execution
 * - Constraint handling
 *
 * @param requirements - Task requirements
 * @param constraints - Optional constraints
 * @returns Execution plan and results
 */
async function orchestratorWorker(requirements: string, constraints = '') {
  const prompt = `Requirements:\n${requirements}${
    constraints ? `\n\nConstraints:\n${constraints}` : ''
  }`
  const totalUsage = {inputTokens: 0, outputTokens: 0, totalTokens: 0}

  // Orchestrator: Generate execution plan
  const {object: plan, usage: planUsage} = (await generateObject({
    model: openai('gpt-4.1-mini'),
    schema: z.object({
      tasks: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
        })
      ),
    }),
    prompt: `Create a plan to address the following:\n\n${prompt}\n\nProvide a list of tasks, each with a name and description.`,
  })) as {
    object: {tasks: {name: string; description: string}[]}
    usage: any
  }

  if (planUsage) {
    totalUsage.inputTokens += planUsage.promptTokens || 0
    totalUsage.outputTokens += planUsage.completionTokens || 0
    totalUsage.totalTokens += planUsage.totalTokens || 0
  }

  // Workers: Execute planned tasks
  const results = await Promise.all(
    plan.tasks.map(async (task) => {
      const {text, usage} = await generateText({
        model: openai('gpt-4.1-mini'),

        system: `You are a specialized worker performing the "${task.name}" task.`,
        prompt: `${task.description}\n\nRequirements: ${requirements}${
          constraints ? `\nConstraints: ${constraints}` : ''
        }`,
      })

      if (usage) {
        totalUsage.inputTokens += usage.inputTokens || 0
        totalUsage.outputTokens += usage.outputTokens || 0
        totalUsage.totalTokens += usage.totalTokens || 0
      }

      return {task: task.name, result: text}
    })
  )

  return JSON.stringify({plan, results, usage: totalUsage}, null, 2)
}

/**
 * Evaluator-Optimizer Agent
 *
 * Implements iterative content improvement:
 * 1. Evaluates content quality
 * 2. Generates improvements
 * 3. Repeats until quality threshold met
 *
 * Features:
 * - Quality scoring
 * - Detailed feedback
 * - Improvement suggestions
 * - Early stopping on high quality
 *
 * @param content - Content to optimize
 * @param criteria - Evaluation criteria
 * @returns Improvement iterations and final content
 */
async function evaluatorOptimizer(content: string, criteria: string) {
  const iterations: {
    iteration: number
    evaluation: {quality: number; feedback: string}
    output: string
  }[] = []
  const totalUsage = {inputTokens: 0, outputTokens: 0, totalTokens: 0}
  let currentContent = content

  // Maximum of 2 improvement iterations
  for (let i = 0; i < 2; i++) {
    // Evaluation phase
    const {object: evaluation, usage: evaluationUsage} = (await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: z.object({
        quality: z.number().min(0).max(10),
        feedback: z.string(),
      }),
      prompt: `Evaluate the following content based on these criteria:\n${criteria}\n\nContent:\n${currentContent}\n\nProvide a quality score (0-10) and detailed yet concise feedback.`,
    })) as {object: {quality: number; feedback: string}; usage: any}

    if (evaluationUsage) {
      totalUsage.inputTokens += evaluationUsage.promptTokens || 0
      totalUsage.outputTokens += evaluationUsage.completionTokens || 0
      totalUsage.totalTokens += evaluationUsage.totalTokens || 0
    }

    // Optimization phase
    const {text: improvedContent, usage: improvementUsage} = await generateText(
      {
        model: openai('gpt-4.1-mini'),
        system:
          'You are an optimizer focused on improving content based on specific criteria.',
        prompt: `Improve the following content based on the evaluation:\n\nContent:\n${currentContent}\n\nCriteria:\n${criteria}\n\nCurrent Evaluation:\n${evaluation.feedback}`,
      }
    )

    if (improvementUsage) {
      totalUsage.inputTokens += improvementUsage.inputTokens || 0
      totalUsage.outputTokens += improvementUsage.outputTokens || 0
      totalUsage.totalTokens += improvementUsage.totalTokens || 0
    }

    iterations.push({
      iteration: i + 1,
      evaluation,
      output: improvedContent,
    })

    // Early stopping if quality threshold reached
    if (evaluation.quality >= 9) {
      break
    }

    currentContent = improvedContent
  }

  return JSON.stringify(
    {
      iterations,
      finalOutput: iterations.at(-1)?.output || content,
      usage: totalUsage,
    },
    null,
    2
  )
}
