"use client"

import { useState, useRef, useEffect } from "react"

interface UseFileDropOptions {
  onDrop?: (files: FileList) => void
  accept?: string[]
}

export function useFileDrop({ onDrop, accept = ["application/pdf"] }: UseFileDropOptions = {}) {
  const [isDragging, setIsDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = dropRef.current
    if (!element) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Only set isDragging to false if we're leaving the drop zone
      if (e.currentTarget === element) {
        setIsDragging(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = e.dataTransfer.files

        // Check if the dropped file type is accepted and size is within limit
        const isAccepted = Array.from(files).some(
          (file) => accept.some((type) => file.type === type) && file.size <= 1 * 1024 * 1024,
        )

        if (isAccepted && onDrop) {
          onDrop(files)
        }
      }
    }

    element.addEventListener("dragover", handleDragOver)
    element.addEventListener("dragenter", handleDragEnter)
    element.addEventListener("dragleave", handleDragLeave)
    element.addEventListener("drop", handleDrop)

    return () => {
      element.removeEventListener("dragover", handleDragOver)
      element.removeEventListener("dragenter", handleDragEnter)
      element.removeEventListener("dragleave", handleDragLeave)
      element.removeEventListener("drop", handleDrop)
    }
  }, [accept, onDrop])

  return { isDragging, dropRef }
}
