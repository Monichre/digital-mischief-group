"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileImage,
  File,
  Sparkles,
  Download,
} from "lucide-react"

interface ProcessedDocument {
  id: string
  filename: string
  type: string
  size: number
  status: "pending" | "processing" | "completed" | "failed"
  extractedData?: {
    title?: string
    summary?: string
    entities?: string[]
    keywords?: string[]
    sentiment?: string
    language?: string
    pageCount?: number
    wordCount?: number
  }
  error?: string
}

interface DocumentProcessorProps {
  onProcessComplete?: (documents: ProcessedDocument[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
}

export function DocumentProcessor({
  onProcessComplete,
  acceptedTypes = [".pdf", ".docx", ".txt", ".csv", ".xlsx"],
  maxFiles = 10,
}: DocumentProcessorProps) {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      filename: file.name,
      type: file.type || getFileType(file.name),
      size: file.size,
      status: "pending" as const,
      file,
    }))
    setDocuments((prev) => [...prev, ...newDocs])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles,
  })

  const getFileType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    const types: Record<string, string> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      csv: "text/csv",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    return types[ext || ""] || "application/octet-stream"
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-4 h-4 text-red-400" />
    if (type.includes("spreadsheet") || type.includes("csv"))
      return <FileSpreadsheet className="w-4 h-4 text-green-400" />
    if (type.includes("image")) return <FileImage className="w-4 h-4 text-blue-400" />
    return <File className="w-4 h-4 text-zinc-400" />
  }

  const processDocuments = async () => {
    setIsProcessing(true)
    setProgress(0)

    const pendingDocs = documents.filter((d) => d.status === "pending")
    let completed = 0

    for (const doc of pendingDocs) {
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "processing" } : d)))

      try {
        // Read file as base64
        const file = (doc as ProcessedDocument & { file: File }).file
        const base64 = await fileToBase64(file)

        // Call AI processing endpoint
        const response = await fetch("/api/ai/process-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: {
              data: base64,
              mediaType: doc.type,
              filename: doc.filename,
            },
          }),
        })

        if (!response.ok) throw new Error("Processing failed")

        const { extractedData } = await response.json()

        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "completed", extractedData } : d)))
      } catch (error) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "failed", error: (error as Error).message } : d)),
        )
      }

      completed++
      setProgress((completed / pendingDocs.length) * 100)
    }

    setIsProcessing(false)
    if (onProcessComplete) {
      onProcessComplete(documents)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data URL prefix
      }
      reader.onerror = reject
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const exportResults = () => {
    const completedDocs = documents.filter((d) => d.status === "completed")
    const exportData = completedDocs.map((d) => ({
      filename: d.filename,
      ...d.extractedData,
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "processed-documents.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100 font-mono text-sm">
            <Sparkles className="w-4 h-4 text-orange-500" />
            AI DOCUMENT PROCESSOR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${
                isDragActive
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-zinc-700 hover:border-zinc-600 bg-zinc-950/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-8 h-8 mx-auto mb-4 ${isDragActive ? "text-orange-500" : "text-zinc-500"}`} />
            {isDragActive ? (
              <p className="text-orange-400 font-mono">DROP FILES HERE...</p>
            ) : (
              <>
                <p className="text-zinc-400 mb-2">Drag & drop files here, or click to select</p>
                <p className="text-zinc-600 text-sm font-mono">
                  Supports: {acceptedTypes.join(", ")} (Max {maxFiles} files)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-zinc-100 font-mono text-sm">DOCUMENTS ({documents.length})</CardTitle>
              <div className="flex gap-2">
                {documents.some((d) => d.status === "completed") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                    className="border-zinc-700 text-zinc-300 font-mono text-xs bg-transparent"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    EXPORT
                  </Button>
                )}
                <Button
                  onClick={processDocuments}
                  disabled={isProcessing || !documents.some((d) => d.status === "pending")}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-mono text-xs"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  PROCESS ALL
                </Button>
              </div>
            </div>
            {isProcessing && <Progress value={progress} className="mt-2 h-1" />}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.type)}
                    <div>
                      <p className="text-zinc-200 text-sm">{doc.filename}</p>
                      <p className="text-zinc-600 text-xs font-mono">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "pending" && (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-mono text-xs">
                        PENDING
                      </Badge>
                    )}
                    {doc.status === "processing" && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 font-mono text-xs">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        PROCESSING
                      </Badge>
                    )}
                    {doc.status === "completed" && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        COMPLETE
                      </Badge>
                    )}
                    {doc.status === "failed" && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50 font-mono text-xs">
                        <XCircle className="w-3 h-3 mr-1" />
                        FAILED
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="text-zinc-500 hover:text-red-400 h-6 w-6 p-0"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted Data Display */}
      {documents.some((d) => d.status === "completed" && d.extractedData) && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 font-mono text-sm">EXTRACTED INTELLIGENCE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents
              .filter((d) => d.status === "completed" && d.extractedData)
              .map((doc) => (
                <div key={doc.id} className="p-4 bg-zinc-950/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(doc.type)}
                    <span className="text-zinc-200 font-mono text-sm">{doc.filename}</span>
                  </div>
                  {doc.extractedData?.title && <p className="text-zinc-100 font-semibold">{doc.extractedData.title}</p>}
                  {doc.extractedData?.summary && <p className="text-zinc-400 text-sm">{doc.extractedData.summary}</p>}
                  <div className="flex flex-wrap gap-2">
                    {doc.extractedData?.keywords?.map((kw, i) => (
                      <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-300 text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                  {doc.extractedData?.entities && doc.extractedData.entities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {doc.extractedData.entities.map((entity, i) => (
                        <Badge key={i} className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DocumentProcessor
