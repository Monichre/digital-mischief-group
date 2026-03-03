"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, X, AlertCircle, Loader2, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { analyzePdf } from "../lib/actions"
import { MarkdownRenderer } from "./markdown"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for analysis

interface UploadState {
  status: "idle" | "uploaded" | "analyzing" | "error" | "success"
  fileName?: string
  fileBuffer?: ArrayBuffer
  error?: string
  result?: string
}

export function UploadZoneWrapper() {
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" })
  const [question, setQuestion] = useState("What is this document about?")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const buffer = await file.arrayBuffer()
      setUploadState({
        status: "uploaded",
        fileName: file.name,
        fileBuffer: buffer,
      })
      toast.success("PDF uploaded", { description: "Now ask a question about it." })
    } catch (error) {
      setUploadState({
        status: "error",
        fileName: file.name,
        error: error instanceof Error ? error.message : "Failed to read file",
      })
    }
  }, [])

  const onDropRejected = useCallback((fileRejections: readonly { file: File; errors: readonly { code: string }[] }[]) => {
    const rejection = fileRejections[0]
    if (!rejection) return

    const hasTypeError = rejection.errors.some((e) => e.code === "file-invalid-type")
    const hasSizeError = rejection.errors.some((e) => e.code === "file-too-large")

    const errorMessage = hasTypeError
      ? "Only PDF files are supported."
      : hasSizeError
        ? "PDF file size exceeds 10MB limit."
        : "Unable to accept this file."

    setUploadState({
      status: "error",
      fileName: rejection.file?.name,
      error: errorMessage,
    })
    toast.error("Upload failed", { description: errorMessage })
  }, [])

  const handleAnalyze = async () => {
    if (!uploadState.fileBuffer || !question.trim()) return

    setUploadState((prev) => ({ ...prev, status: "analyzing" }))

    try {
      const result = await analyzePdf({
        pdfBuffer: uploadState.fileBuffer,
        question: question.trim(),
      })

      if (typeof result === "object" && "error" in result) {
        throw result.error
      }

      setUploadState((prev) => ({ ...prev, status: "success", result }))
      toast.success("Analysis complete!")
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Analysis failed",
      }))
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploadState.status === "analyzing",
  })

  const reset = () => {
    setUploadState({ status: "idle" })
    setQuestion("What is this document about?")
  }

  // Show results view
  if (uploadState.status === "success" && uploadState.result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-emerald-400" />
            <span className="font-medium text-stone-200">
              {uploadState.fileName}
            </span>
          </div>
          <Button
            className="border-stone-800 bg-black/60 text-stone-200 hover:border-orange-500/40 hover:text-orange-300"
            variant="outline"
            size="sm"
            onClick={reset}
          >
            Analyze another document
          </Button>
        </div>
        <div className="rounded-xl border border-stone-900/80 bg-black/50 p-6 text-stone-200">
          <h3 className="font-semibold mb-2">Question:</h3>
          <p className="text-stone-400 mb-4">{question}</p>
          <h3 className="font-semibold mb-2">Answer:</h3>
          <MarkdownRenderer content={uploadState.result} />
        </div>
      </div>
    )
  }

  // Show uploaded state with question input
  if (uploadState.status === "uploaded" || uploadState.status === "analyzing") {
    return (
      <div className="space-y-4 rounded-3xl border border-stone-900/80 bg-black/40 p-6 text-stone-200">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-2">
            <FileText className="size-6 text-orange-300" />
          </div>
          <div>
            <p className="font-medium text-stone-200">{uploadState.fileName}</p>
            <p className="text-sm text-stone-500">PDF ready for analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question about this document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={uploadState.status === "analyzing"}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            className="border-stone-800 bg-black/60 text-stone-200 placeholder:text-stone-600"
          />
          <Button
            onClick={handleAnalyze}
            disabled={uploadState.status === "analyzing" || !question.trim()}
            className="bg-orange-500 text-black hover:bg-orange-400"
          >
            {uploadState.status === "analyzing" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <Button
          className="text-stone-400 hover:text-orange-300"
          variant="ghost"
          size="sm"
          onClick={reset}
        >
          Choose different file
        </Button>
      </div>
    )
  }

  // Show error state
  if (uploadState.status === "error") {
    return (
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4 text-red-200">
        <AlertCircle className="size-8 text-red-300 mx-auto" />
        <div>
          <h3 className="font-medium text-red-200">Error</h3>
          <p className="text-sm text-red-200/80">{uploadState.error}</p>
        </div>
        <Button
          className="border-red-500/40 bg-black/40 text-red-200 hover:border-red-400"
          variant="outline"
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    )
  }

  // Show idle/upload state
  return (
    <div className="relative rounded-[1.65rem] border border-stone-900/80 bg-black/40 p-1">
      <div {...getRootProps()}>
        <div className={cn(
          "relative rounded-3xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer text-stone-200",
          isDragActive && !isDragReject && "border-orange-500/60 bg-orange-500/10",
          isDragReject && "border-red-500/60 bg-red-500/10",
          !isDragActive && "border-stone-800 hover:border-orange-500/40 hover:bg-orange-500/5"
        )}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full border border-orange-500/40 bg-orange-500/10 p-4">
              <Upload className="size-8 text-orange-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-100">Upload a PDF</h3>
              <p className="text-sm text-stone-400">
                Drag and drop or <span className="text-orange-300 font-medium">browse</span>
              </p>
              <p className="text-xs text-stone-500 mt-1">Max 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PdfFileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill="none" {...props}>
      <path d="M20 12.9999V10.6568C20 9.83929 20 9.43054 19.8478 9.063C19.6955 8.69546 19.4065 8.40643 18.8284 7.82837L14.0919 3.09182C13.593 2.59294 13.3436 2.34349 13.0345 2.19568C12.9702 2.16494 12.9044 2.13766 12.8372 2.11395C12.5141 1.99994 12.1614 1.99994 11.4558 1.99994C8.21082 1.99994 6.58831 1.99994 5.48933 2.88601C5.26731 3.06502 5.06508 3.26725 4.88607 3.48927C4 4.58825 4 6.21076 4 9.45578V12.9999M13 2.49994V2.99994C13 5.82837 13 7.24258 13.8787 8.12126C14.7574 8.99994 16.1716 8.99994 19 8.99994H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.75 16.001H17.25C16.6977 16.001 16.25 16.4487 16.25 17.001V19.001M16.25 19.001V22.001M16.25 19.001H19.25M4.25 22.001V19.501M4.25 19.501V16.001H6C6.9665 16.001 7.75 16.7845 7.75 17.751C7.75 18.7175 6.9665 19.501 6 19.501H4.25ZM10.25 16.001H11.75C12.8546 16.001 13.75 16.8964 13.75 18.001V20.001C13.75 21.1055 12.8546 22.001 11.75 22.001H10.25V16.001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Txt01Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill="none" {...props}>
      <path d="M3.5 13V12.1963C3.5 9.22892 3.5 7.74523 3.96894 6.56024C4.72281 4.65521 6.31714 3.15255 8.33836 2.44201C9.59563 2.00003 11.1698 2.00003 14.3182 2.00003C16.1173 2.00003 17.0168 2.00003 17.7352 2.25259C18.8902 2.65861 19.8012 3.51728 20.232 4.60587C20.5 5.283 20.5 6.13082 20.5 7.82646V12.0142V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.1211 16L12.0034 19M12.0034 19L13.8858 22M12.0034 19L13.8858 16M12.0034 19L10.1211 22M16.7392 16H18.6216M18.6216 16H20.5039M18.6216 16V22M3.50391 16H5.38626M5.38626 16H7.26861M5.38626 16V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export const Doc01Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill="none" {...props}>
    <path d="M20.5007 17.2196C20.4486 16.0292 19.674 16 18.6231 16C17.0044 16 16.736 16.406 16.736 18V20C16.736 21.594 17.0044 22 18.6231 22C19.674 22 20.4486 21.9708 20.5007 20.7804M7.26568 19C7.26568 20.6569 6.00155 22 4.44215 22C4.0903 22 3.91437 22 3.78333 21.9196C3.46959 21.7272 3.50098 21.3376 3.50098 21V17C3.50098 16.6624 3.46959 16.2728 3.78333 16.0804C3.91437 16 4.0903 16 4.44215 16C6.00155 16 7.26568 17.3431 7.26568 19ZM12.0007 22C11.1134 22 10.6697 22 10.394 21.7071C10.1184 21.4142 10.1184 20.9428 10.1184 20V18C10.1184 17.0572 10.1184 16.5858 10.394 16.2929C10.6697 16 11.1134 16 12.0007 16C12.8881 16 13.3318 16 13.6074 16.2929C13.8831 16.5858 13.8831 17.0572 13.8831 18V20C13.8831 20.9428 13.8831 21.4142 13.6074 21.7071C13.3318 22 12.8881 22 12.0007 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M20 12.9999V10.6568C20 9.83929 20 9.43054 19.8478 9.063C19.6955 8.69546 19.4065 8.40643 18.8284 7.82837L14.0919 3.09182C13.593 2.59294 13.3436 2.34349 13.0345 2.19568C12.9702 2.16494 12.9044 2.13766 12.8372 2.11395C12.5141 1.99994 12.1614 1.99994 11.4558 1.99994C8.21082 1.99994 6.58831 1.99994 5.48933 2.88601C5.26731 3.06502 5.06508 3.26725 4.88607 3.48927C4 4.58825 4 6.21076 4 9.45578V12.9999M13 2.49994V2.99994C13 5.82837 13 7.24258 13.8787 8.12126C14.7574 8.99994 16.1716 8.99994 19 8.99994H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
