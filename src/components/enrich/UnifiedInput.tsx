"use client"

import type React from "react"
import { useCallback, useState, useRef } from "react"
import { Upload, FileSpreadsheet, X, AlertCircle, Search, Loader2, LinkIcon, File } from "lucide-react"

interface UnifiedInputProps {
  onTextSubmit: (input: string) => void
  onCsvUpload: (data: Record<string, string>[], headers: string[]) => void
  isLoading?: boolean
  isDisabled?: boolean
}

export function UnifiedInput({ onTextSubmit, onCsvUpload, isLoading = false, isDisabled = false }: UnifiedInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"idle" | "text" | "file">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): { data: Record<string, string>[]; headers: string[] } => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) throw new Error("CSV must have headers and at least one data row")

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""))
    const data: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""))
      const row: Record<string, string> = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx] || ""
      })
      data.push(row)
    }

    return { data, headers }
  }

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      setFileName(file.name)
      setMode("file")

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        setFileName(null)
        setMode("idle")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const { data, headers } = parseCSV(text)

          if (data.length === 0) {
            setError("CSV file is empty")
            return
          }

          if (data.length > 100) {
            setError("Maximum 100 rows allowed per batch")
            return
          }

          onCsvUpload(data, headers)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to parse CSV")
          setFileName(null)
          setMode("idle")
        }
      }
      reader.onerror = () => {
        setError("Failed to read file")
        setFileName(null)
        setMode("idle")
      }
      reader.readAsText(file)
    },
    [onCsvUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim() || isLoading) return
    onTextSubmit(textInput.trim())
  }

  const handleTextFocus = () => {
    if (mode !== "file") setMode("text")
  }

  const clearFile = () => {
    setFileName(null)
    setError(null)
    setMode("idle")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Main Input Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 transition-all duration-300
          ${
            isDragging
              ? "border-orange-500 bg-orange-500/10 border-dashed"
              : fileName
                ? "border-orange-500/50 bg-orange-500/5"
                : "border-zinc-700 hover:border-zinc-600"
          }
          ${isDisabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {/* Corner Accents */}
        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isDisabled || isLoading}
        />

        {/* Content */}
        {fileName ? (
          /* File Selected State */
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-200 font-medium">{fileName}</p>
                <p className="text-xs text-zinc-500">CSV file ready for enrichment</p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : isDragging ? (
          /* Dragging State */
          <div className="p-12 flex flex-col items-center justify-center">
            <Upload className="w-12 h-12 text-orange-500 mb-4 animate-bounce" />
            <p className="text-lg text-orange-500 font-medium">Drop CSV file here</p>
          </div>
        ) : (
          /* Default State - Text Input + File Options */
          <div className="p-4">
            {/* Text Input Row */}
            <form onSubmit={handleTextSubmit} className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onFocus={handleTextFocus}
                  placeholder="Enter URL, email, or domain (e.g., stripe.com)"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-600 outline-none text-sm focus:border-orange-500/50 transition-colors"
                  disabled={isDisabled || isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !textInput.trim() || isDisabled}
                className="px-6 py-3 bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ENRICHING</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>ENRICH</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-xs text-zinc-600 uppercase tracking-wider">or bulk enrich</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* File Upload Options */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={isDisabled || isLoading}
                className="flex-1 p-4 border border-dashed border-zinc-700 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-3 group"
              >
                <File className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 transition-colors" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  Click to select CSV
                </span>
              </button>
              <div className="flex-1 p-4 border border-dashed border-zinc-700 flex items-center justify-center gap-3 text-zinc-600">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Drag & drop CSV</span>
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs text-zinc-600 text-center mt-3">Maximum 100 rows per batch • Supports .csv files</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
