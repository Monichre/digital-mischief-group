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
    <div className='flex w-full flex-col items-center justify-center text-stone-200'>
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: [0.23, 1, 0.32, 1]}}
        className='w-full max-w-2xl'
      >
        <Card className='w-full overflow-hidden border border-stone-900/80 bg-black/50'>
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='pdf-upload'
                  className='text-xs font-medium text-stone-300 tracking-widest uppercase'
                >
                  PDF Document
                </Label>
                {file && (
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='text-xs text-stone-500 hover:text-orange-300 transition-colors'
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
                      'ring-2 ring-orange-500/30 ring-offset-2 ring-offset-black'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center h-24 rounded-md border border-dashed border-stone-800 bg-black/40 px-4 py-5 text-center transition-all',
                      isDragging
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'hover:bg-orange-500/5'
                    )}
                  >
                    <UploadIcon className='mb-2 h-5 w-5 text-stone-500' />
                    <div className='text-xs text-stone-500'>
                      <span className='font-medium text-stone-200'>
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <p className='mt-1 text-xs text-stone-600'>
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
                    'flex items-center rounded-md border border-stone-900/80 p-3',
                    success
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'bg-black/40'
                  )}
                >
                  <div className='mr-3 flex h-8 w-8 items-center justify-center rounded-md border border-orange-500/40 bg-orange-500/10'>
                    <FileIcon className='h-4 w-4 text-orange-300' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p
                      className='max-w-[180px] truncate text-xs font-medium text-stone-200'
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className='text-xs text-stone-500'>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleRemoveFile}
                    className='ml-2 rounded-full p-1 text-stone-500 hover:bg-stone-900 transition-colors'
                  >
                    <XIcon className='h-3.5 w-3.5 text-stone-500' />
                  </button>
                </motion.div>
              )}
            </div>

            <div className='space-y-3'>
              <Label
                htmlFor='question'
                className='text-xs font-medium text-stone-300 tracking-widest uppercase'
              >
                Question
              </Label>
              <Textarea
                id='question'
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                className='min-h-[40px] resize-none border-stone-800 bg-black/40 text-sm text-stone-200 placeholder:text-stone-600 focus-visible:ring-orange-500/30'
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
                        ? 'bg-yellow-500/10 border border-yellow-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        error.type === 'rateLimit'
                          ? 'text-yellow-200'
                          : 'text-red-200'
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
              className='h-9 w-full bg-orange-500 text-sm font-medium text-black hover:bg-orange-400'
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
                <div className='border-t border-stone-900/80 bg-black/40 px-6 py-5'>
                  <h2 className='text-sm font-medium text-stone-200'>
                    Response
                  </h2>
                  <div className='space-y-6 rounded-md border border-stone-900/80 bg-black/50 p-4'>
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
