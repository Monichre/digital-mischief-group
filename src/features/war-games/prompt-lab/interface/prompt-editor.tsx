'use client'

import {readStreamableValue} from '@ai-sdk/rsc'
import {zodResolver} from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Info,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react'
import {AnimatePresence, motion} from 'motion/react'
import {useEffect, useState} from 'react'
import {type UseFormReturn, useFieldArray, useForm} from 'react-hook-form'
import {toast} from 'sonner'
import type {z} from 'zod'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {Label} from '@/components/ui/label'
import {Progress} from '@/components/ui/progress'
import {ScrollArea} from '@/components/ui/scroll-area'
import {cn} from '@/lib/utils'
import {evaluatePrompt, improveExamples} from '../lib/actions'
import {
  type AnalysisResult,
  defaultExamples,
  promptFormSchema,
} from '../lib/schema'
import {AutosizeTextarea} from './auto-resize-text-area'
import {CodePreview} from './code-preview'
import {ProgressiveBlur} from './progressive-blur'

type FormData = z.infer<typeof promptFormSchema>

export function PromptEditor() {
  const [promptResult, setPromptResult] = useState<string | null>(null)
  const [isPromptLoading, setIsPromptLoading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isImprovingExamples, setIsImprovingExamples] = useState(false)
  const [streamedResult, setStreamedResult] =
    useState<Partial<AnalysisResult> | null>(null)
  const [improvedExamples, setImprovedExamples] = useState<{
    examples: Array<{input: string; output: string; explanation: string}>
    reasoningText: string
  } | null>(null)

  const [activeExample, setActiveExample] = useState<
    keyof typeof defaultExamples | null
  >(null)

  const form = useForm<FormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      systemPrompt: '',
      examples: [{input: '', output: ''}],
      testInput: '',
    },
  })

  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: 'examples',
  })

  async function runPrompt(data: FormData) {
    try {
      setIsPromptLoading(true)
      setPromptResult(null)
      setStreamedResult(null)
      setImprovedExamples(null)

      const result = await evaluatePrompt(data)

      // The server action returns the collected result, not a stream
      // Handle both cases: when it's a streamable value and when it's already resolved
      if (result.output && typeof result.output === 'object' && Symbol.asyncIterator in Object(result.output)) {
        for await (const chunk of readStreamableValue(result.output as Parameters<typeof readStreamableValue>[0])) {
          if (typeof chunk === 'string') {
            setPromptResult(chunk)
          } else {
            setPromptResult(JSON.stringify(chunk, null, 2))
          }
        }
      } else {
        // Already resolved value from server action
        if (typeof result.output === 'string') {
          setPromptResult(result.output)
        } else {
          setPromptResult(JSON.stringify(result.output, null, 2))
        }
      }
    } catch (error) {
      console.error('[PromptEditor] Error running prompt:', error)
    } finally {
      setIsPromptLoading(false)
    }
  }

  async function evaluateOutput() {
    if (!promptResult) return

    try {
      setIsEvaluating(true)
      const result = await evaluatePrompt({
        ...form.getValues(),
        evaluation: true,
        output: promptResult,
      })

      // Handle both streamable value and already-resolved result
      const processChunk = (chunk: unknown) => {
        if (chunk && typeof chunk === 'object' && 'analysis' in chunk) {
          const analysisChunk = chunk as { analysis: Partial<AnalysisResult['analysis']> }
          setStreamedResult((prev) => ({
            ...prev,
            analysis: {
              consistency:
                analysisChunk.analysis?.consistency ?? prev?.analysis?.consistency ?? 0,
              relevance:
                analysisChunk.analysis?.relevance ?? prev?.analysis?.relevance ?? 0,
              quality: analysisChunk.analysis?.quality ?? prev?.analysis?.quality ?? 0,
              feedback:
                analysisChunk.analysis?.feedback ?? prev?.analysis?.feedback ?? '',
            },
          }))
        }
      }

      if (result.output && typeof result.output === 'object' && Symbol.asyncIterator in Object(result.output)) {
        for await (const chunk of readStreamableValue(result.output as Parameters<typeof readStreamableValue>[0])) {
          processChunk(chunk)
        }
      } else {
        // Already resolved value from server action
        processChunk(result.output)
      }
    } catch (error) {
      console.error('[PromptEditor] Error evaluating:', error)
      toast.error('Failed to evaluate output')
    } finally {
      setIsEvaluating(false)
    }
  }

  async function handleImproveExamples() {
    if (!promptResult) return

    try {
      setIsImprovingExamples(true)
      const result = await improveExamples({
        ...form.getValues(),
        evaluation: true,
        output: promptResult,
      })

      for await (const chunk of readStreamableValue(result.output)) {
        if (chunk && typeof chunk === 'object' && 'examples' in chunk) {
          setImprovedExamples(chunk as any)
        }
      }
    } catch (error) {
      console.error('[PromptEditor] Error improving examples:', error)
      toast.error('Failed to improve examples')
    } finally {
      setIsImprovingExamples(false)
    }
  }

  return (
    <div className='mx-auto h-full w-full p-4 text-stone-200'>
      <div className='grid w-full gap-6 lg:grid-cols-2'>
        <div className='space-y-4'>
          <Header />
          {/* Editor Section */}
          <PromptEditorForm
            activeExample={activeExample}
            append={append}
            fields={fields}
            form={form}
            isPromptLoading={isPromptLoading}
            remove={remove}
            runPrompt={runPrompt}
            setActiveExample={setActiveExample}
          />
        </div>

        {/* Results Section */}
        <div className='h-[calc(100vh-4rem)] overflow-y-auto border border-stone-900/80 border-dashed bg-black/30 pb-2'>
          <div className='space-y-4 p-3'>
            <div className=''>
              <CodeSnippet
                {...form.getValues()}
                isGenerating={isPromptLoading}
              />
            </div>

            <AnimatePresence mode='wait'>
              {promptResult && (
                <motion.div
                  animate={{opacity: 1, y: 0}}
                  className='space-y-4'
                  initial={{opacity: 0, y: 20}}
                  key='results'
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                    delay: 0.1,
                  }}
                >
                  {/* Output */}
                  <Output
                    evaluateOutput={evaluateOutput}
                    isEvaluating={isEvaluating}
                    promptResult={promptResult}
                    streamedResult={streamedResult}
                  />

                  {/* Analysis Results */}
                  <AnalysisResults streamedResult={streamedResult} />

                  {/* After the Analysis Results section */}
                  {streamedResult && !isEvaluating && (
                    <ImprovedExamples
                      form={form}
                      handleImproveExamples={handleImproveExamples}
                      improvedExamples={improvedExamples}
                      isImprovingExamples={isImprovingExamples}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className='flex items-center gap-2 text-stone-400'>
      <div className='hidden rounded-full p-1 lg:block'>
        <VercelIcon className='size-4 text-orange-400' />
      </div>
      <span className='hidden text-stone-500 text-xs lg:block'>/</span>
      <h1 className='inline-flex items-center gap-1 font-bold text-xs tracking-[0.2em] uppercase'>
        <span className='hidden lg:block'>AI</span>
        <span className='hidden lg:block'>SDK</span>
        <span className='hidden px-1 text-stone-500 text-xs lg:block'>/</span>
        <div className='relative rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-0.5 font-medium text-[10px] text-orange-200 shadow-[0_0_12px_rgba(251,146,60,0.2)]'>
          <span className='relative z-10'>Few Shot Prompt Evaluator</span>
        </div>
      </h1>
    </div>
  )
}

function PromptEditorForm({
  form,
  isPromptLoading,
  activeExample,
  setActiveExample,
  fields,
  append,
  remove,
  runPrompt,
}: {
  runPrompt: (data: FormData) => void
  form: UseFormReturn<FormData>
  isPromptLoading: boolean
  activeExample: keyof typeof defaultExamples | null
  setActiveExample: (example: keyof typeof defaultExamples | null) => void
  fields: ReturnType<typeof useFieldArray<FormData, 'examples'>>['fields']
  append: ReturnType<typeof useFieldArray<FormData, 'examples'>>['append']
  remove: ReturnType<typeof useFieldArray<FormData, 'examples'>>['remove']
}) {
  return (
    <Form {...form}>
      <form className='space-y-4' onSubmit={form.handleSubmit(runPrompt)}>
        <ScrollArea className='w-full border border-stone-900/80 bg-black/40 px-4 py-2'>
          <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
            Quick Start
          </Label>
          <div className='flex gap-2 py-2 pl-[1px]'>
            {Object.entries(defaultExamples).map(([key, example]) => (
              <Badge
                className={cn(
                  'cursor-pointer rounded-none border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] transition-colors',
                  activeExample === key
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-200'
                    : 'border-stone-800 bg-black/30 text-stone-300 hover:border-orange-500/40 hover:text-orange-300'
                )}
                key={key}
                onClick={() => {
                  form.reset({
                    systemPrompt: example.systemPrompt,
                    examples: example.examples,
                    testInput: '',
                  })
                  setActiveExample(key as keyof typeof defaultExamples)
                }}
                variant='outline'
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Badge>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className='h-[37rem] border border-stone-900/80 bg-black/40 p-4'>
          <div className='space-y-4 pr-3 pb-2 pl-1'>
            {/* System Prompt */}
            <FormField
              control={form.control}
              name='systemPrompt'
              render={({field}) => (
                <FormItem>
                  <div className='flex items-center'>
                    <FormLabel className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
                      System Prompt
                    </FormLabel>
                    <CompleteBadge
                      isComplete={isFieldComplete(form.watch('systemPrompt'))}
                    />
                  </div>
                  <FormControl>
                    <AutosizeTextarea
                      className='rounded-none border border-stone-800 bg-black/50 font-sans text-sm text-stone-200 placeholder:text-stone-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/40 md:text-xs'
                      minHeight={30}
                      placeholder='You are a helpful assistant...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Examples */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <FormLabel className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
                      Few Shot Examples{' '}
                      <span className='text-[8px] text-orange-400'>
                        [{fields.length}]
                      </span>
                    </FormLabel>
                    <CompleteBadge
                      isComplete={isFieldComplete(form.watch('examples'))}
                    />
                  </div>
                <Button
                  className='group h-7 rounded-none text-[10px] text-stone-300 hover:text-orange-300'
                  onClick={() => append({input: '', output: ''})}
                  size='sm'
                  type='button'
                  variant='ghost'
                >
                  <Plus className='mr-1 h-3 w-3 transition-all delay-75 duration-150 ease-out group-hover:rotate-90 group-hover:scale-110' />
                  Add Example
                </Button>
              </div>

              <div className='space-y-3'>
                {fields.map((field, index) => (
                  <div
                    className='group relative flex items-start justify-between gap-2 space-y-2 border border-stone-900/80 border-dashed bg-black/30 p-2'
                    key={field.id}
                  >
                    <div className='flex-1'>
                      <div className='grid gap-2 sm:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={`examples.${index}.input`}
                          render={({field}) => (
                            <FormItem>
                              <div className='flex items-center'>
                                <FormLabel className='font-medium text-[9px] text-stone-500 tracking-widest uppercase'>
                                  Input
                                </FormLabel>
                                <CompleteBadge
                                  isComplete={isFieldComplete(field.value)}
                                />
                              </div>
                              <FormControl>
                                <AutosizeTextarea
                                  className='h-20 resize-none rounded-none border border-stone-800 bg-black/50 font-sans text-xs text-stone-200 placeholder:text-stone-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/40'
                                  minHeight={30}
                                  placeholder='Input...'
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`examples.${index}.output`}
                          render={({field}) => (
                            <FormItem>
                              <div className='flex items-center'>
                                <FormLabel className='font-medium text-[9px] text-stone-500 tracking-widest uppercase'>
                                  Output
                                </FormLabel>
                                <CompleteBadge
                                  isComplete={isFieldComplete(field.value)}
                                />
                              </div>
                              <FormControl>
                                <AutosizeTextarea
                                  className='h-20 resize-none rounded-none border border-stone-800 bg-black/50 font-sans text-xs text-stone-200 placeholder:text-stone-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/40'
                                  minHeight={30}
                                  placeholder='Output...'
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className='invisible absolute bottom-2 left-2 translate-y-1 opacity-0 transition-all duration-200 ease-in-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'>
                      <Button
                        className='h-5 rounded-none border border-stone-800 bg-black/60 py-3 text-stone-400 text-xs hover:text-red-400'
                        onClick={() => remove(index)}
                        size='sm'
                        type='button'
                        variant='ghost'
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Input */}
            <FormField
              control={form.control}
              name='testInput'
              render={({field}) => (
                <FormItem>
                  <div className='flex items-center'>
                    <FormLabel className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
                      Input
                    </FormLabel>
                    <CompleteBadge isComplete={isFieldComplete(field.value)} />
                  </div>
                  <FormControl>
                    <AutosizeTextarea
                      className='resize-none rounded-none border border-stone-800 bg-black/50 font-sans text-sm text-stone-200 placeholder:text-stone-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/40'
                      minHeight={30}
                      placeholder='Enter test input...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

        <Button
          className='w-full rounded-none bg-orange-500 text-black hover:bg-orange-400'
          disabled={isPromptLoading}
          type='submit'
        >
          {isPromptLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Running...
            </>
          ) : (
            <>
              <Wand2 className='mr-2 h-4 w-4' />
              Run Prompt
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

function Output({
  promptResult,
  evaluateOutput,
  isEvaluating,
  streamedResult,
}: {
  promptResult: string
  evaluateOutput: () => void
  isEvaluating: boolean
  streamedResult: Partial<AnalysisResult> | null
}) {
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
          Output
        </Label>
        {!streamedResult?.analysis && (
          <div className='flex gap-2'>
            <Button
              className='group h-6 rounded-none border border-stone-800 bg-black/40 text-xs text-stone-300 hover:text-orange-300'
              disabled={isEvaluating}
              onClick={evaluateOutput}
              size='sm'
              variant='outline'
            >
              {isEvaluating ? (
                <>
                  <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                  Evaluating...
                </>
              ) : (
                <>
                  <Sparkles className='group-hover:-rotate-12 mr-1 h-3 w-3 transition-all duration-150 ease-out group-hover:scale-110' />
                  Evaluate
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      <motion.pre
        animate={{height: 'auto', opacity: 1}}
        className='group relative whitespace-pre-wrap border border-stone-900/80 bg-black/40 p-3 font-sans text-[11px] text-stone-200'
        initial={{height: 0, opacity: 0}}
      >
        {promptResult}

        <Button
          className='absolute top-0 right-0 hidden h-6 rounded-none border border-stone-800 bg-black/60 text-xs text-stone-300 group-hover:flex hover:text-orange-300'
          onClick={() => {
            navigator.clipboard.writeText(promptResult)
            toast.success('Copied to clipboard')
          }}
          size='sm'
          variant='ghost'
        >
          <Copy className='mr-1 h-3 w-3' />
        </Button>
      </motion.pre>
    </div>
  )
}

function AnalysisResults({
  streamedResult,
}: {
  streamedResult: Partial<AnalysisResult> | null
}) {
  return (
    <AnimatePresence>
      {streamedResult && (
        <motion.div
          animate={{opacity: 1, y: 0}}
          className='mt-6 space-y-1'
          exit={{opacity: 0, y: -20}}
          initial={{opacity: 0, y: 20}}
        >
          <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
            Evaluation
          </Label>
          <div className='space-y-4 border border-stone-900/80 bg-black/40 p-3'>
            <div className='grid gap-3 lg:grid-cols-3'>
              {[
                {
                  label: 'Consistency',
                  value: streamedResult.analysis?.consistency ?? 0,
                },
                {
                  label: 'Relevance',
                  value: streamedResult.analysis?.relevance ?? 0,
                },
                {
                  label: 'Quality',
                  value: streamedResult.analysis?.quality ?? 0,
                },
              ].map(({label, value}) => (
                <div className='space-y-1.5' key={label}>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium text-[8px] text-stone-400 tracking-widest uppercase'>
                      {label}
                    </span>
                    <span className='text-[8px] tabular-nums text-stone-400'>
                      {value}/100
                    </span>
                  </div>
                  <Progress
                    className={cn(
                      'h-1.5 bg-stone-800',
                      value < 30 && '[&>div]:bg-red-500',
                      value >= 30 && value < 70 && '[&>div]:bg-yellow-500',
                      value >= 70 && '[&>div]:bg-green-500'
                    )}
                    value={value}
                  />
                </div>
              ))}
            </div>

            {streamedResult.analysis?.feedback && (
              <div
                className={cn(
                  'border p-3 text-[11px] leading-tight',
                  streamedResult.analysis.consistency < 30 &&
                    'border-red-500/20 bg-red-500/10 text-red-200',
                  streamedResult.analysis.consistency >= 30 &&
                    streamedResult.analysis.consistency < 70 &&
                    'border-yellow-500/20 bg-yellow-500/10 text-yellow-100',
                  streamedResult.analysis.consistency >= 70 &&
                    'border-green-500/20 bg-green-500/10 text-green-100'
                )}
              >
                {streamedResult.analysis.feedback}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ImprovedExamplesData {
  examples: Array<{input: string; output: string; explanation: string}>
  reasoningText: string
}

function ImprovedExamples({
  form,
  improvedExamples,
  handleImproveExamples,
  isImprovingExamples,
}: {
  form: UseFormReturn<FormData>
  improvedExamples: ImprovedExamplesData | null
  handleImproveExamples: () => void
  isImprovingExamples: boolean
}) {
  console.log('improvedExamples', improvedExamples)
  return (
    <div className='mt-4 space-y-1'>
      {!improvedExamples && (
        <div className='flex items-center justify-between px-2 py-3'>
          <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
            Want better examples?
          </Label>
          <Button
            className='group h-6 rounded-none border border-stone-800 bg-black/40 text-xs text-stone-300 hover:text-orange-300'
            disabled={isImprovingExamples}
            onClick={handleImproveExamples}
            size='sm'
            variant='outline'
          >
            {isImprovingExamples ? (
              <>
                <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className='group-hover:-rotate-12 mr-1 h-3 w-3 transition-all duration-150 ease-out group-hover:scale-110' />
                Improve Examples
              </>
            )}
          </Button>
        </div>
      )}
      <AnimatePresence>
        {improvedExamples && (
          <motion.div
            animate={{opacity: 1, y: 0}}
            className='space-y-4'
            exit={{opacity: 0, y: -20}}
            initial={{opacity: 0, y: 20}}
          >
            <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
              Improve
            </Label>
          </motion.div>
        )}
      </AnimatePresence>
      <div className='space-y-4 border border-stone-900/80 bg-black/40'>
        {improvedExamples && (
          <ScrollArea className='relative h-[326px]'>
            <>
              <ProgressiveBlur
                blurIntensity={0.2}
                className='pointer-events-none absolute top-0 right-0 h-[30px] w-full'
                direction='top'
              />
              <ProgressiveBlur
                blurIntensity={0.2}
                className='pointer-events-none absolute right-0 bottom-0 h-[30px] w-full'
                direction='bottom'
              />
            </>

            <AnimatePresence>
              {improvedExamples && (
                <motion.div
                  animate={{opacity: 1, y: 0}}
                  className='space-y-4'
                  exit={{opacity: 0, y: -20}}
                  initial={{opacity: 0, y: 20}}
                >
                  <div className='px-2 py-2'>
                    <div className='mb-3 p-2 text-xs'>
                      <p className='mb-2 font-medium text-[10px]'>
                        Improvement Reasoning:
                      </p>
                      <p className='text-stone-400'>
                        {improvedExamples.reasoningText ||
                          'No reasoning provided'}
                      </p>
                    </div>

                    <div className='space-y-3 pr-4 pb-1 pl-1'>
                      {improvedExamples.examples &&
                        improvedExamples.examples.map((example, index) => (
                          <Card
                            className='space-y-2 rounded-none border border-stone-900/80 bg-black/50 p-3'
                            key={index}
                          >
                            <div className='flex items-center justify-between'>
                              <span className='font-medium text-stone-500 text-xs'>
                                {index + 1}
                              </span>
                              <Button
                                className='h-6 rounded-none border border-stone-800 bg-black/40 text-[10px] text-stone-300 hover:text-orange-300'
                                onClick={() => {
                                  const newExamples = [
                                    ...form.getValues().examples,
                                  ]
                                  newExamples[index] = {
                                    input: example.input,
                                    output: example.output,
                                  }
                                  form.setValue('examples', newExamples)
                                  toast.success('Example updated')
                                }}
                                size='sm'
                                variant='ghost'
                              >
                                <ArrowLeft className='mr-1 h-3 w-3' />
                                Use This Example
                              </Button>
                            </div>
                            <div className='grid gap-2 sm:grid-cols-2'>
                              <div className='space-y-1'>
                                <div className='text-[8px] text-stone-500 tracking-widest uppercase'>
                                  Input:
                                </div>
                                <pre className='whitespace-pre-wrap border border-stone-900/80 bg-black/40 p-2 font-sans text-xs text-stone-200'>
                                  {example.input}
                                </pre>
                              </div>
                              <div className='space-y-1'>
                                <div className='text-[8px] text-stone-500 tracking-widest uppercase'>
                                  Output:
                                </div>
                                <pre className='whitespace-pre-wrap border border-stone-900/80 bg-black/40 p-2 font-sans text-xs text-stone-200'>
                                  {example.output}
                                </pre>
                              </div>
                            </div>
                            <div className='mt-2 flex flex-col gap-[2px] text-xs'>
                              <span className='font-medium text-[8px] text-stone-500 tracking-widest uppercase'>
                                Why this example?{' '}
                              </span>
                              <span>{example.explanation}</span>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        )}
        <AnimatePresence>
          {improvedExamples && (
            <motion.div
              animate={{opacity: 1, y: 0}}
              className='-mt-3'
              exit={{opacity: 0, y: -20}}
              initial={{opacity: 0, y: 20}}
            >
              <Button
                className='-mt-3 w-full rounded-none border border-stone-900/80 bg-black/50 text-stone-300 hover:text-orange-300'
                onClick={() => {
                  if (
                    improvedExamples.examples &&
                    Array.isArray(improvedExamples.examples)
                  ) {
                    form.setValue(
                      'examples',
                      improvedExamples.examples.map(({input, output}) => ({
                        input,
                        output,
                      }))
                    )
                    toast.success('All examples updated')
                  }
                }}
                size='sm'
                variant='ghost'
              >
                <ArrowLeft className='mr-1 h-3 w-3' />
                Use All Examples
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function VercelIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      height='222'
      preserveAspectRatio='xMidYMid'
      viewBox='0 0 256 222'
      width='256'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='m128 0 128 221.705H0z' fill='currentColor' />
    </svg>
  )
}

// Add this new component for displaying code snippets
function CodeSnippet({
  systemPrompt,
  examples,
  testInput,
  isGenerating,
}: FormData & {isGenerating: boolean}) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  // Auto-collapse when generating
  useEffect(() => {
    if (isGenerating) {
      setIsExpanded(false)
    }
  }, [isGenerating])

  const code = `import { openai } from "@ai-sdk/openai";
  import { generateText } from "ai";
  
  export async function generateResponse(input: string) {
    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      system: ${JSON.stringify(systemPrompt)},
      messages: [
        ${examples
          .map(
            (ex) => `
        { role: "user", content: ${JSON.stringify(ex.input)} },
        { role: "assistant", content: ${JSON.stringify(ex.output)} },`
          )
          .join('')}
        { role: "user", content: input },
      ],
    });
  
    return text;
  }`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy')
    }
  }

  return (
    <motion.div
      animate={{opacity: 1, y: 0}}
      className='border border-stone-900/80 bg-black/40'
      initial={{opacity: 0, y: 20}}
    >
      <motion.div
        animate={{
          backgroundColor: isExpanded ? 'transparent' : 'hsl(var(--muted))',
          borderColor: isExpanded ? 'hsl(var(--border))' : 'transparent',
        }}
        className='flex items-center justify-between border-b border-stone-900/80 bg-black/40 p-1 pl-2'
        transition={{duration: 0.3}}
      >
        <div className='flex items-center gap-2'>
          <Label className='font-medium text-[10px] text-stone-400 tracking-widest uppercase'>
            AI SDK Code Snippet
          </Label>
          <Button
            className={cn(
              'h-6 px-2 text-stone-400 transition-all duration-200 hover:text-orange-300',
              !isExpanded && 'text-stone-500'
            )}
            onClick={() => setIsExpanded(!isExpanded)}
            size='sm'
            variant='ghost'
          >
            <motion.div
              animate={{rotate: isExpanded ? 0 : -90}}
              transition={{duration: 0.3, ease: [0.32, 0.72, 0, 1]}}
            >
              <ChevronDown className='h-3 w-3' />
            </motion.div>
          </Button>
        </div>
        <motion.button
          className='group relative h-7 w-auto gap-1.5 rounded-none border border-stone-800 bg-black/50 px-2 text-[10px] text-stone-300 transition-colors hover:border-orange-500/40 hover:text-orange-300'
          layout
          onClick={copyToClipboard}
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
        >
          <AnimatePresence mode='wait'>
            {copied ? (
              <motion.div
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                className='flex items-center gap-1.5'
                exit={{opacity: 0, y: -10}}
                initial={{opacity: 0, y: 10}}
                key='copied'
              >
                <motion.div
                  animate={{scale: 1}}
                  initial={{scale: 0}}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    delay: 0.1,
                  }}
                >
                  <Check className='h-3 w-3 text-green-500' />
                </motion.div>
                <span className='font-medium text-green-500'>Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,

                  transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                className='flex items-center gap-1.5 text-stone-400'
                exit={{opacity: 0, y: -10}}
                initial={{opacity: 0, y: 10}}
                key='copy'
              >
                <motion.div
                  animate={{rotate: 0}}
                  initial={{rotate: -90}}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  <Copy className='group-hover:-rotate-12 h-3 w-3 text-stone-400 transition-all duration-150 ease-out group-hover:scale-110' />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
      <motion.div
        animate={{
          height: isExpanded ? 'auto' : '0px',
          opacity: isExpanded ? 1 : 0.7,
          scale: isExpanded ? 1 : 0.98,
        }}
        className='overflow-hidden'
        initial={false}
        transition={{
          height: {
            duration: 0.3,
            ease: [0.32, 0.72, 0, 1],
          },
          opacity: {
            duration: 0.2,
          },
          scale: {
            duration: 0.2,
          },
        }}
      >
        <div className='overflow-x-auto px-3 py-3'>
          <CodePreview
            className='text-xs leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0'
            code={code}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Add completion check function
function isFieldComplete(value: any): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) {
    return (
      value.length > 0 &&
      value.every((item) =>
        Object.values(item).every(
          (val) => typeof val === 'string' && val.trim().length > 0
        )
      )
    )
  }
  return false
}

// Add animated checkmark badge component
function CompleteBadge({isComplete}: {isComplete: boolean}) {
  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div
          animate={{opacity: 1, scale: 1}}
          className='ml-2 inline-flex'
          exit={{opacity: 0, scale: 0.5}}
          initial={{opacity: 0, scale: 0.5}}
        >
          <Badge
            className='flex h-3 w-3 items-center justify-center border border-emerald-500/40 bg-emerald-500/15 p-0 text-emerald-300'
            variant='secondary'
          >
            <Check className='h-2 w-2' />
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
