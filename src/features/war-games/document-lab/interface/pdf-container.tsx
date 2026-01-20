'use client'

import type React from 'react'

import {useState, useRef} from 'react'
import {AnimatePresence, motion} from 'motion/react'
import {FileIcon, UploadIcon, XIcon} from 'lucide-react'

import {Button} from '@/components/ui/button'
import {Card} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'

import {cn} from '@/lib/utils'
import {useFileDrop} from '@/hooks/use-file-drop'
import {LoadingDots} from './loading-dots'
import {MarkdownRenderer} from './markdown'

import {analyzePdf} from '../lib/actions'

export function PdfContainer() {
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('What is this document about?')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{message: string; type?: string} | null>(
    null
  )
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {isDragging, dropRef} = useFileDrop({
    onDrop: (files) => {
      if (files[0]) {
        setFile(files[0])
        setError(null)
        setSuccess(true)

        // Reset success state after animation completes
        setTimeout(() => setSuccess(false), 2000)
      }
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size <= 1 * 1024 * 1024) {
        setFile(file)
        setError(null)
        setSuccess(true)

        // Reset success state after animation completes
        setTimeout(() => setSuccess(false), 2000)
      } else {
        setError({message: 'File size exceeds 1MB limit'})
      }
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError({message: 'Please select a PDF file'})
      return
    }

    try {
      setLoading(true)
      setResponse('')
      setError(null)

      // Convert file to ArrayBuffer
      const buffer = await file.arrayBuffer()

      // Call the server action
      const result = await analyzePdf({
        pdfBuffer: buffer,
        question,
      })

      if (typeof result === 'object' && result !== null && 'error' in result) {
        const errorMessage = result.error.message

        if (errorMessage.includes('Rate limit exceeded')) {
          setError({message: errorMessage, type: 'rateLimit'})
        } else if (
          errorMessage.includes('API key') ||
          errorMessage.includes('Authentication')
        ) {
          setError({
            message:
              'OpenAI API key issue. Please check your environment variables and ensure you have a valid API key.',
            type: 'apiConfig',
          })
        } else if (
          errorMessage.includes('quota') ||
          errorMessage.includes('billing')
        ) {
          setError({
            message:
              'OpenAI account issue. Please check your OpenAI account billing and usage limits.',
            type: 'billing',
          })
        } else {
          setError({message: errorMessage})
        }
      } else {
        setResponse(result as string)
      }
    } catch (err: any) {
      console.error('Client-side error:', err)
      setError({
        message:
          err.message ||
          'An error occurred while analyzing the PDF. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex  flex-col items-center justify-center w-full'>
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: [0.23, 1, 0.32, 1]}}
        className='w-full max-w-2xl'
      >
        <Card className='w-full overflow-hidden border-none bg-card shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]'>
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='pdf-upload'
                  className='text-xs font-medium text-foreground'
                >
                  PDF Document
                </Label>
                {file && (
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                  >
                    Remove
                  </button>
                )}
              </div>

              {!file ? (
                <div
                  ref={dropRef}
                  className={cn(
                    'relative group cursor-pointer',
                    isDragging &&
                      'ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center h-24 rounded-md border border-dashed border-border/60 bg-muted/40 px-4 py-5 text-center transition-all',
                      isDragging
                        ? 'border-primary/50 bg-primary/5'
                        : 'hover:bg-muted/60'
                    )}
                  >
                    <UploadIcon className='h-5 w-5 text-muted-foreground mb-2' />
                    <div className='text-xs text-muted-foreground'>
                      <span className='font-medium text-foreground'>
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <p className='text-xs text-muted-foreground/70 mt-1'>
                      PDF (max 1MB)
                    </p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    id='pdf-upload'
                    type='file'
                    accept='application/pdf'
                    onChange={handleFileChange}
                    className='sr-only'
                  />
                </div>
              ) : (
                <motion.div
                  initial={{opacity: 0, y: 5}}
                  animate={{opacity: 1, y: 0}}
                  className={cn(
                    'flex items-center p-3 rounded-md border border-border/40',
                    success
                      ? 'border-green-500/30 bg-green-50 dark:bg-green-950/20'
                      : 'bg-muted/30'
                  )}
                >
                  <div className='flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 mr-3'>
                    <FileIcon className='h-4 w-4 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p
                      className='text-xs font-medium text-foreground truncate max-w-[180px]'
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='ml-2 p-1 rounded-full hover:bg-muted/60 transition-colors'
                  >
                    <XIcon className='h-3.5 w-3.5 text-muted-foreground' />
                  </button>
                </motion.div>
              )}
            </div>

            <div className='space-y-3'>
              <Label
                htmlFor='question'
                className='text-xs font-medium text-foreground'
              >
                Question
              </Label>
              <Textarea
                id='question'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                className='resize-none min-h-[40px] text-sm bg-muted/30 border-border/40 focus-visible:ring-primary/30'
                placeholder='What would you like to know about this document?'
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: 'auto'}}
                  exit={{opacity: 0, height: 0}}
                  className='overflow-hidden'
                >
                  <div
                    className={`px-3 py-2 rounded-md ${
                      error.type === 'rateLimit'
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30'
                        : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30'
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        error.type === 'rateLimit'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {error.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type='submit'
              className='w-full font-medium text-sm h-9'
              disabled={loading || !file}
            >
              {loading ? (
                <span className='flex items-center'>
                  <span className='mr-2'>Analyzing</span>
                  <LoadingDots />
                </span>
              ) : (
                'Analyze PDF'
              )}
            </Button>
          </form>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{opacity: 0, height: 0}}
                animate={{opacity: 1, height: 'auto'}}
                exit={{opacity: 0, height: 0}}
                transition={{duration: 0.3, ease: [0.23, 1, 0.32, 1]}}
                className='overflow-hidden'
              >
                <div className='px-6 py-5 border-t border-border/30 bg-muted/20'>
                  <h2 className='text-sm font-medium text-foreground'>
                    Response
                  </h2>
                  <div className='rounded-md space-y-6 p-4 bg-card shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)'>
                    <MarkdownRenderer content={response} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  )
}
