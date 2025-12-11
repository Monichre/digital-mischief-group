"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react"

interface CsvUploaderProps {
  onUpload: (data: Record<string, string>[], headers: string[]) => void
  isDisabled?: boolean
}

export function CsvUploader({ onUpload, isDisabled }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

      if (!file.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        setFileName(null)
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

          if (data.length > 500) {
            setError("Maximum 500 rows allowed per batch")
            return
          }

          onUpload(data, headers)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to parse CSV")
          setFileName(null)
        }
      }
      reader.onerror = () => {
        setError("Failed to read file")
        setFileName(null)
      }
      reader.readAsText(file)
    },
    [onUpload],
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const clearFile = () => {
    setFileName(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed transition-all duration-200 p-8
          ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-zinc-700 hover:border-zinc-600"}
          ${isDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer"}
        `}
      >
        {/* Corner Accents */}
        <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-orange-500" />
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-orange-500" />
        <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-orange-500" />
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-orange-500" />

        <input
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isDisabled}
        />

        <div className="flex flex-col items-center text-center">
          {fileName ? (
            <>
              <FileSpreadsheet className="w-10 h-10 text-orange-500 mb-3" />
              <p className="text-sm text-zinc-200 font-medium mb-1">{fileName}</p>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  clearFile()
                }}
                className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-400 mb-1">
                <span className="text-orange-500 font-medium">Drop CSV here</span> or click to upload
              </p>
              <p className="text-xs text-zinc-600">Maximum 500 rows per batch</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
